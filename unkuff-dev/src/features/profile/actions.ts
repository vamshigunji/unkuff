"use server";

import { db } from "@/lib/db";
import { profiles, workExperience, education, skills, certifications, accomplishments, powerStatements } from "./schema";
import { encrypt, decrypt } from "@/lib/encryption";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { generateEmbedding } from "@/lib/embeddings";
import { batchScoring } from "@/features/matching/services/scoring-service";
import { revalidatePath } from "next/cache";
import { appEvents, EVENTS } from "@/lib/events";

// ============================================================================
// TYPES & VALIDATION SCHEMAS
// ============================================================================

export type ProfileData = {
    name?: string;
    bio?: string;
    summary?: string;
    location?: string;
    phone?: string;
    address?: string;
    idNumber?: string;
};

export type ActionResponse<T> = {
    data: T | null;
    error: string | null;
};

const WorkExperienceSchema = z.object({
    company: z.string().min(1, "Company name is required"),
    title: z.string().min(1, "Job title is required"),
    description: z.string().optional(),
    accomplishments: z.array(z.string()).optional(),
    location: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    isCurrent: z.boolean().optional(),
});

const EducationSchema = z.object({
    institution: z.string().min(1, "Institution name is required"),
    degree: z.string().optional(),
    fieldOfStudy: z.string().optional(),
    location: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
});

const SkillSchema = z.object({
    name: z.string().min(1, "Skill name is required"),
    level: z.enum(["beginner", "intermediate", "advanced", "expert"]).optional(),
    category: z.string().optional(),
});

const CertificationSchema = z.object({
    name: z.string().min(1, "Certification name is required"),
    issuer: z.string().min(1, "Issuer is required"),
    issueDate: z.string().optional(),
    expiryDate: z.string().optional(),
    credentialId: z.string().optional(),
    link: z.string().url().optional().or(z.literal("")),
});

// ============================================================================
// PROFILE ACTIONS
// ============================================================================

export async function saveProfile(data: ProfileData): Promise<ActionResponse<{ id: string }>> {
    const session = await auth();
    if (!session?.user?.id) {
        return { data: null, error: "Unauthorized" };
    }

    const userId = session.user.id;

    try {
        const encryptedData = {
            ...data,
            phone: data.phone ? encrypt(data.phone) : undefined,
            address: data.address ? encrypt(data.address) : undefined,
            idNumber: data.idNumber ? encrypt(data.idNumber) : undefined,
            userId: userId,
            updatedAt: new Date(),
        };

        const existing = await db.query.profiles.findFirst({
            where: eq(profiles.userId, userId),
        });

        if (existing) {
            await db
                .update(profiles)
                .set(encryptedData)
                .where(eq(profiles.userId, userId));

            void updateBioEmbedding(userId);
            appEvents.emit(EVENTS.PROFILE_UPDATED, { userId });
            return { data: { id: existing.id }, error: null };
        } else {
            const result = await db.insert(profiles).values(encryptedData as any).returning({ id: profiles.id });
            void updateBioEmbedding(userId);
            appEvents.emit(EVENTS.PROFILE_UPDATED, { userId });
            return { data: { id: result[0].id }, error: null };
        }
    } catch (error) {
        console.error("Failed to save profile:", error);
        return { data: null, error: "Failed to save profile" };
    }
}

/**
 * Ensures a profile exists for the current user, creating one if needed.
 * Returns the profile ID (not user ID) for use in child records.
 * This is needed because skills, education, etc. reference profiles.id.
 */
async function ensureProfileExists(): Promise<string | null> {
    const session = await auth();
    if (!session?.user?.id) {
        return null;
    }

    const userId = session.user.id;

    try {
        const existing = await db.query.profiles.findFirst({
            where: eq(profiles.userId, userId),
            columns: { id: true },
        });

        if (existing) {
            return existing.id;
        }

        // Create a new profile for this user
        const result = await db.insert(profiles).values({
            userId: userId,
        }).returning({ id: profiles.id });

        return result[0].id;
    } catch (error) {
        console.error("Failed to ensure profile exists:", error);
        return null;
    }
}


export async function getProfile() {
    const session = await auth();
    if (!session?.user?.id) {
        return null;
    }

    const userId = session.user.id;

    try {
        const profile = await db.query.profiles.findFirst({
            where: eq(profiles.userId, userId),
        });

        if (!profile) return null;

        return {
            ...profile,
            phone: profile.phone ? decrypt(profile.phone) : null,
            address: profile.address ? decrypt(profile.address) : null,
            idNumber: profile.idNumber ? decrypt(profile.idNumber) : null,
        };
    } catch (error) {
        console.error("Failed to get profile:", error);
        return null;
    }
}

// TODO: [Review] When calling this in fire-and-forget mode, use after() (Next.js 15) or waitUntil() for Vercel/Serverless reliability
export async function updateBioEmbedding(userId: string): Promise<ActionResponse<boolean>> {
    const session = await auth();
    if (!session?.user?.id || session.user.id !== userId) {
        return { data: null, error: "Unauthorized" };
    }

    try {
        const profile = await db.query.profiles.findFirst({
            where: eq(profiles.userId, userId),
        });

        if (!profile) {
            return { data: null, error: "Profile not found" };
        }

        // Fetch aggregation data
        const userSkills = await db.query.skills.findMany({ where: eq(skills.profileId, profile.id) });
        const userExperience = await db.query.workExperience.findMany({ where: eq(workExperience.profileId, profile.id) });

        const fullProfile = {
            ...profile,
            skills: userSkills,
            workExperience: userExperience,
        };

        const textToEmbed = await aggregateProfileText(fullProfile);

        // Generate embedding using Task 1 utility
        const embedding = await generateEmbedding(textToEmbed);

        // Update database
        await db.update(profiles)
            .set({
                bioEmbedding: embedding,
                updatedAt: new Date()
            })
            .where(eq(profiles.userId, userId));

        // Trigger batch rescoring (Task 7)
        void batchScoring(userId).catch((err: unknown) => console.error("Batch scoring failed:", err));

        revalidatePath("/dashboard");
        return { data: true, error: null };

    } catch (error) {
        console.error("Failed to update bio embedding:", error);
        return { data: null, error: "Failed to update embedding" };
    }
}

export async function aggregateProfileText(profile: any): Promise<string> {
    const parts: string[] = [];

    if (profile.bio) parts.push(`Bio: ${profile.bio}`);
    if (profile.summary) parts.push(`Summary: ${profile.summary}`);

    // Skills
    if (profile.skills && profile.skills.length > 0) {
        const skillNames = profile.skills.map((s: any) => s.name).join(", ");
        parts.push(`Skills: ${skillNames}`);
    }

    // Work Experience
    if (profile.workExperience && profile.workExperience.length > 0) {
        parts.push("Work Experience:");
        profile.workExperience.forEach((exp: any) => {
            const part = `${exp.title} at ${exp.company}.${exp.description ? " " + exp.description : ""}`;
            parts.push(part);
        });
    }

    return parts.join("\n\n");
}

// ============================================================================
// WORK EXPERIENCE ACTIONS
// ============================================================================

export async function addWorkExperience(
    _profileId: string, // Ignored - we use ensureProfileExists instead
    data: z.infer<typeof WorkExperienceSchema>
): Promise<ActionResponse<{ id: string }>> {
    const session = await auth();
    if (!session?.user?.id) {
        return { data: null, error: "Unauthorized" };
    }

    try {
        // Ensure profile exists before adding work experience (foreign key constraint)
        const profileId = await ensureProfileExists();
        if (!profileId) {
            return { data: null, error: "Failed to create profile" };
        }

        const validated = WorkExperienceSchema.parse(data);
        const result = await db.insert(workExperience).values({
            profileId,
            company: validated.company,
            title: validated.title,
            description: validated.description || null,
            accomplishments: validated.accomplishments || null,
            location: validated.location || null,
            startDate: validated.startDate ? new Date(validated.startDate) : null,
            endDate: validated.endDate ? new Date(validated.endDate) : null,
            isCurrent: validated.isCurrent ? "true" : "false",
        }).returning({ id: workExperience.id });

        void updateBioEmbedding(session.user.id);
        return { data: { id: result[0].id }, error: null };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { data: null, error: error.issues[0]?.message || "Validation failed" };
        }
        console.error("Failed to add work experience:", error);
        return { data: null, error: "Failed to add work experience" };
    }
}

export async function updateWorkExperience(
    id: string,
    data: z.infer<typeof WorkExperienceSchema>
): Promise<ActionResponse<{ id: string }>> {
    const session = await auth();
    if (!session?.user?.id) {
        return { data: null, error: "Unauthorized" };
    }

    try {
        const validated = WorkExperienceSchema.parse(data);
        await db.update(workExperience)
            .set({
                company: validated.company,
                title: validated.title,
                description: validated.description || null,
                accomplishments: validated.accomplishments || null,
                location: validated.location || null,
                startDate: validated.startDate ? new Date(validated.startDate) : null,
                endDate: validated.endDate ? new Date(validated.endDate) : null,
                isCurrent: validated.isCurrent ? "true" : "false",
                updatedAt: new Date(),
            })
            .where(eq(workExperience.id, id));

        void updateBioEmbedding(session.user.id);
        return { data: { id }, error: null };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { data: null, error: error.issues[0]?.message || "Validation failed" };
        }
        console.error("Failed to update work experience:", error);
        return { data: null, error: "Failed to update work experience" };
    }
}

export async function deleteWorkExperience(id: string): Promise<ActionResponse<boolean>> {
    const session = await auth();
    if (!session?.user?.id) {
        return { data: null, error: "Unauthorized" };
    }

    try {
        await db.delete(workExperience).where(eq(workExperience.id, id));
        void updateBioEmbedding(session.user.id);
        return { data: true, error: null };
    } catch (error) {
        console.error("Failed to delete work experience:", error);
        return { data: null, error: "Failed to delete work experience" };
    }
}

// ============================================================================
// EDUCATION ACTIONS
// ============================================================================

export async function addEducation(
    _profileId: string, // Ignored - we use ensureProfileExists instead
    data: z.infer<typeof EducationSchema>
): Promise<ActionResponse<{ id: string }>> {
    const session = await auth();
    if (!session?.user?.id) {
        return { data: null, error: "Unauthorized" };
    }

    try {
        // Ensure profile exists before adding education (foreign key constraint)
        const profileId = await ensureProfileExists();
        if (!profileId) {
            return { data: null, error: "Failed to create profile" };
        }

        const validated = EducationSchema.parse(data);
        const result = await db.insert(education).values({
            profileId,
            institution: validated.institution,
            degree: validated.degree || null,
            fieldOfStudy: validated.fieldOfStudy || null,
            location: validated.location || null,
            startDate: validated.startDate ? new Date(validated.startDate) : null,
            endDate: validated.endDate ? new Date(validated.endDate) : null,
        }).returning({ id: education.id });

        return { data: { id: result[0].id }, error: null };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { data: null, error: error.issues[0]?.message || "Validation failed" };
        }
        console.error("Failed to add education:", error);
        return { data: null, error: "Failed to add education" };
    }
}


export async function updateEducation(
    id: string,
    data: z.infer<typeof EducationSchema>
): Promise<ActionResponse<{ id: string }>> {
    const session = await auth();
    if (!session?.user?.id) {
        return { data: null, error: "Unauthorized" };
    }

    try {
        const validated = EducationSchema.parse(data);
        await db.update(education)
            .set({
                institution: validated.institution,
                degree: validated.degree || null,
                fieldOfStudy: validated.fieldOfStudy || null,
                location: validated.location || null,
                startDate: validated.startDate ? new Date(validated.startDate) : null,
                endDate: validated.endDate ? new Date(validated.endDate) : null,
                updatedAt: new Date(),
            })
            .where(eq(education.id, id));

        return { data: { id }, error: null };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { data: null, error: error.issues[0]?.message || "Validation failed" };
        }
        console.error("Failed to update education:", error);
        return { data: null, error: "Failed to update education" };
    }
}

export async function deleteEducation(id: string): Promise<ActionResponse<boolean>> {
    const session = await auth();
    if (!session?.user?.id) {
        return { data: null, error: "Unauthorized" };
    }

    try {
        await db.delete(education).where(eq(education.id, id));
        return { data: true, error: null };
    } catch (error) {
        console.error("Failed to delete education:", error);
        return { data: null, error: "Failed to delete education" };
    }
}

// ============================================================================
// SKILLS ACTIONS
// ============================================================================

export async function addSkill(
    _profileId: string, // Ignored - we use ensureProfileExists instead
    data: z.infer<typeof SkillSchema>
): Promise<ActionResponse<{ id: string }>> {
    const session = await auth();
    if (!session?.user?.id) {
        return { data: null, error: "Unauthorized" };
    }

    try {
        // Ensure profile exists before adding skill (foreign key constraint)
        const profileId = await ensureProfileExists();
        if (!profileId) {
            return { data: null, error: "Failed to create profile" };
        }

        const validated = SkillSchema.parse(data);
        const result = await db.insert(skills).values({
            profileId,
            name: validated.name,
            level: validated.level || null,
            category: validated.category || null,
        }).returning({ id: skills.id });

        void updateBioEmbedding(session.user.id);
        return { data: { id: result[0].id }, error: null };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { data: null, error: error.issues[0]?.message || "Validation failed" };
        }
        console.error("Failed to add skill:", error);
        return { data: null, error: "Failed to add skill" };
    }
}


export async function updateSkill(
    id: string,
    data: z.infer<typeof SkillSchema>
): Promise<ActionResponse<{ id: string }>> {
    const session = await auth();
    if (!session?.user?.id) {
        return { data: null, error: "Unauthorized" };
    }

    try {
        const validated = SkillSchema.parse(data);
        await db.update(skills)
            .set({
                name: validated.name,
                level: validated.level || null,
                category: validated.category || null,
                updatedAt: new Date(),
            })
            .where(eq(skills.id, id));

        void updateBioEmbedding(session.user.id);
        return { data: { id }, error: null };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { data: null, error: error.issues[0]?.message || "Validation failed" };
        }
        console.error("Failed to update skill:", error);
        return { data: null, error: "Failed to update skill" };
    }
}

export async function deleteSkill(id: string): Promise<ActionResponse<boolean>> {
    const session = await auth();
    if (!session?.user?.id) {
        return { data: null, error: "Unauthorized" };
    }

    try {
        await db.delete(skills).where(eq(skills.id, id));
        void updateBioEmbedding(session.user.id);
        return { data: true, error: null };
    } catch (error) {
        console.error("Failed to delete skill:", error);
        return { data: null, error: "Failed to delete skill" };
    }
}

// ============================================================================
// CERTIFICATIONS ACTIONS
// ============================================================================

export async function addCertification(
    _profileId: string, // Ignored - we use ensureProfileExists instead
    data: z.infer<typeof CertificationSchema>
): Promise<ActionResponse<{ id: string }>> {
    const session = await auth();
    if (!session?.user?.id) {
        return { data: null, error: "Unauthorized" };
    }

    try {
        // Ensure profile exists before adding certification (foreign key constraint)
        const profileId = await ensureProfileExists();
        if (!profileId) {
            return { data: null, error: "Failed to create profile" };
        }

        const validated = CertificationSchema.parse(data);
        const result = await db.insert(certifications).values({
            profileId,
            name: validated.name,
            issuer: validated.issuer,
            issueDate: validated.issueDate ? new Date(validated.issueDate) : null,
            expiryDate: validated.expiryDate ? new Date(validated.expiryDate) : null,
            credentialId: validated.credentialId || null,
            link: validated.link || null,
        }).returning({ id: certifications.id });

        return { data: { id: result[0].id }, error: null };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { data: null, error: error.issues[0]?.message || "Validation failed" };
        }
        console.error("Failed to add certification:", error);
        return { data: null, error: "Failed to add certification" };
    }
}


export async function updateCertification(
    id: string,
    data: z.infer<typeof CertificationSchema>
): Promise<ActionResponse<{ id: string }>> {
    const session = await auth();
    if (!session?.user?.id) {
        return { data: null, error: "Unauthorized" };
    }

    try {
        const validated = CertificationSchema.parse(data);
        await db.update(certifications)
            .set({
                name: validated.name,
                issuer: validated.issuer,
                issueDate: validated.issueDate ? new Date(validated.issueDate) : null,
                expiryDate: validated.expiryDate ? new Date(validated.expiryDate) : null,
                credentialId: validated.credentialId || null,
                link: validated.link || null,
            })
            .where(eq(certifications.id, id));

        return { data: { id }, error: null };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { data: null, error: error.issues[0]?.message || "Validation failed" };
        }
        console.error("Failed to update certification:", error);
        return { data: null, error: "Failed to update certification" };
    }
}

export async function deleteCertification(id: string): Promise<ActionResponse<boolean>> {
    const session = await auth();
    if (!session?.user?.id) {
        return { data: null, error: "Unauthorized" };
    }

    try {
        await db.delete(certifications).where(eq(certifications.id, id));
        return { data: true, error: null };
    } catch (error) {
        console.error("Failed to delete certification:", error);
        return { data: null, error: "Failed to delete certification" };
    }
}

// ============================================================================
// ACCOMPLISHMENTS ACTIONS
// ============================================================================

const AccomplishmentSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    impact: z.string().optional(),
    category: z.string().optional(),
});

export async function addAccomplishment(
    profileId: string,
    data: z.infer<typeof AccomplishmentSchema>
): Promise<ActionResponse<{ id: string }>> {
    const session = await auth();
    if (!session?.user?.id) {
        return { data: null, error: "Unauthorized" };
    }

    try {
        const validated = AccomplishmentSchema.parse(data);

        const result = await db.insert(accomplishments).values({
            profileId,
            title: validated.title,
            description: validated.description,
            impact: validated.impact ?? null,
            category: validated.category ?? null,
        }).returning({ id: accomplishments.id });

        return { data: { id: result[0].id }, error: null };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { data: null, error: error.issues[0]?.message || "Validation failed" };
        }
        console.error("Failed to add accomplishment:", error);
        return { data: null, error: "Failed to add accomplishment" };
    }
}

export async function deleteAccomplishment(id: string): Promise<ActionResponse<boolean>> {
    const session = await auth();
    if (!session?.user?.id) {
        return { data: null, error: "Unauthorized" };
    }

    try {
        await db.delete(accomplishments).where(eq(accomplishments.id, id));
        return { data: true, error: null };
    } catch (error) {
        console.error("Failed to delete accomplishment:", error);
        return { data: null, error: "Failed to delete accomplishment" };
    }
}

// ============================================================================
// POWER STATEMENTS ACTIONS
// ============================================================================

const PowerStatementSchema = z.object({
    statement: z.string().min(1, "Statement is required"),
    context: z.string().optional(),
    category: z.string().optional(),
});

export async function addPowerStatement(
    profileId: string,
    data: z.infer<typeof PowerStatementSchema>
): Promise<ActionResponse<{ id: string }>> {
    const session = await auth();
    if (!session?.user?.id) {
        return { data: null, error: "Unauthorized" };
    }

    try {
        const validated = PowerStatementSchema.parse(data);

        const result = await db.insert(powerStatements).values({
            profileId,
            statement: validated.statement,
            context: validated.context ?? null,
            category: validated.category ?? null,
        }).returning({ id: powerStatements.id });

        return { data: { id: result[0].id }, error: null };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { data: null, error: error.issues[0]?.message || "Validation failed" };
        }
        console.error("Failed to add power statement:", error);
        return { data: null, error: "Failed to add power statement" };
    }
}

export async function deletePowerStatement(id: string): Promise<ActionResponse<boolean>> {
    const session = await auth();
    if (!session?.user?.id) {
        return { data: null, error: "Unauthorized" };
    }

    try {
        await db.delete(powerStatements).where(eq(powerStatements.id, id));
        return { data: true, error: null };
    } catch (error) {
        console.error("Failed to delete power statement:", error);
        return { data: null, error: "Failed to delete power statement" };
    }
}

