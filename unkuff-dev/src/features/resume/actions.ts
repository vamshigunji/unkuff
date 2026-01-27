"use server";

import { db } from "@/lib/db";
import { profiles, workExperience, education, skills, certifications } from "@/features/profile/schema";
import { decrypt } from "@/lib/encryption";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";
import type { ResumeData, ResumeExperience, ResumeEducation, ResumeCertification } from "./types";

// ============================================================================
// TYPES
// ============================================================================

export type ActionResponse<T> = {
    data: T | null;
    error: string | null;
};

// ============================================================================
// RESUME DATA ACTIONS
// ============================================================================

/**
 * Fetches all profile data and transforms it into a resume-ready format.
 * This is used by the resume preview to render the user's resume.
 */
export async function getResumeData(): Promise<ActionResponse<ResumeData>> {
    const session = await auth();
    if (!session?.user?.id) {
        return { data: null, error: "Unauthorized" };
    }

    const userId = session.user.id;

    try {
        // Fetch the user's profile
        const profile = await db.query.profiles.findFirst({
            where: eq(profiles.userId, userId),
        });

        if (!profile) {
            return { data: null, error: "Profile not found" };
        }

        const profileId = profile.id;

        // Fetch all related data in parallel
        const [workExp, edu, skillsList, certs] = await Promise.all([
            db.query.workExperience.findMany({
                where: eq(workExperience.profileId, profileId),
                orderBy: (table, { desc }) => [desc(table.startDate)],
            }),
            db.query.education.findMany({
                where: eq(education.profileId, profileId),
                orderBy: (table, { desc }) => [desc(table.startDate)],
            }),
            db.query.skills.findMany({
                where: eq(skills.profileId, profileId),
            }),
            db.query.certifications.findMany({
                where: eq(certifications.profileId, profileId),
                orderBy: (table, { desc }) => [desc(table.issueDate)],
            }),
        ]);

        // Transform data into resume format
        const resumeData: ResumeData = {
            contact: {
                fullName: profile.name || "",
                email: session.user.email || "",
                phone: profile.phone ? decrypt(profile.phone) : null,
                location: profile.location || null,
                linkedin: null, // TODO: Fetch from socialLinks table
                github: null,
                portfolio: null,
            },
            summary: profile.summary || profile.bio || null,
            experience: workExp.map((exp): ResumeExperience => ({
                id: exp.id,
                company: exp.company,
                title: exp.title,
                location: exp.location,
                startDate: exp.startDate ? formatDate(exp.startDate) : null,
                endDate: exp.endDate ? formatDate(exp.endDate) : null,
                isCurrent: exp.isCurrent === "true",
                description: exp.description,
                accomplishments: Array.isArray(exp.accomplishments)
                    ? exp.accomplishments.filter((a): a is string => typeof a === 'string')
                    : [],
            })),
            education: edu.map((ed): ResumeEducation => ({
                id: ed.id,
                institution: ed.institution,
                degree: ed.degree,
                fieldOfStudy: ed.fieldOfStudy,
                location: ed.location,
                startDate: ed.startDate ? formatDate(ed.startDate) : null,
                endDate: ed.endDate ? formatDate(ed.endDate) : null,
            })),
            skills: skillsList.map(s => s.name),
            certifications: certs.map((cert): ResumeCertification => ({
                id: cert.id,
                name: cert.name,
                issuer: cert.issuer,
                issueDate: cert.issueDate ? formatDate(cert.issueDate) : null,
                expiryDate: cert.expiryDate ? formatDate(cert.expiryDate) : null,
                credentialId: cert.credentialId,
            })),
        };

        return { data: resumeData, error: null };
    } catch (error) {
        console.error("Failed to get resume data:", error);
        return { data: null, error: "Failed to load resume data" };
    }
}

/**
 * Check if user has sufficient profile data for resume preview.
 * Returns true if they have at least name and some content.
 */
export async function hasProfileData(): Promise<ActionResponse<boolean>> {
    const session = await auth();
    if (!session?.user?.id) {
        return { data: false, error: "Unauthorized" };
    }

    const userId = session.user.id;

    try {
        const profile = await db.query.profiles.findFirst({
            where: eq(profiles.userId, userId),
            columns: { id: true, name: true, summary: true, bio: true },
        });

        if (!profile) {
            return { data: false, error: null };
        }

        // Check if they have at least a name
        const hasName = Boolean(profile.name);
        const hasSummary = Boolean(profile.summary || profile.bio);

        return { data: hasName || hasSummary, error: null };
    } catch (error) {
        console.error("Failed to check profile data:", error);
        return { data: false, error: "Failed to check profile data" };
    }
}

// ============================================================================
// HELPERS
// ============================================================================

function formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
    });
}
