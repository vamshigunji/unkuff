
'use server';

import { db } from "@/lib/db";
import { jobCriteria } from "./schema";
import { auth } from "@/auth";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { jobMatches } from "./schema";
import { profiles, skills, workExperience } from "@/features/profile/schema";

const jobCriteriaSchema = z.object({
    name: z.string().min(1),
    jobTitles: z.array(z.string()).min(1),
    countryCode: z.string().optional(),
    cities: z.array(z.string()).optional(),
    workModes: z.array(z.string()).optional(),
    employmentTypes: z.array(z.string()).optional(),
    salaryMin: z.number().optional(),
    salaryMax: z.number().optional(),
});

export async function getJobCriteriaAction() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    return await db.query.jobCriteria.findMany({
        where: eq(jobCriteria.userId, session.user.id),
        orderBy: (table, { desc }) => [desc(table.createdAt)],
    });
}

export async function saveJobCriteriaAction(data: z.infer<typeof jobCriteriaSchema> & { id?: string }) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const validatedData = jobCriteriaSchema.parse(data);

    if (data.id) {
        // Update
        await db.update(jobCriteria)
            .set({
                ...validatedData,
                updatedAt: new Date()
            })
            .where(and(eq(jobCriteria.id, data.id), eq(jobCriteria.userId, session.user.id)));
    } else {
        // Create
        await db.insert(jobCriteria).values({
            userId: session.user.id,
            ...validatedData,
            isActive: 1,
        });
    }

    revalidatePath("/dashboard/criteria");
    revalidatePath("/dashboard");
    return { success: true };
}

export async function toggleJobCriteriaAction(id: string, isActive: boolean) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await db.update(jobCriteria)
        .set({ isActive: isActive ? 1 : 0, updatedAt: new Date() })
        .where(and(eq(jobCriteria.id, id), eq(jobCriteria.userId, session.user.id)));

    revalidatePath("/dashboard/criteria");
    revalidatePath("/dashboard");
    return { success: true };
}

export async function deleteJobCriteriaAction(id: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await db.delete(jobCriteria)
        .where(and(eq(jobCriteria.id, id), eq(jobCriteria.userId, session.user.id)));

    revalidatePath("/dashboard/criteria");
    revalidatePath("/dashboard");
    return { success: true };
}

export async function analyzeJobGaps(jobId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const userId = session.user.id;

    // 1. Fetch Job
    const job = await db.query.jobs.findFirst({
        where: (table, { eq, and }) => and(eq(table.id, jobId), eq(table.userId, userId))
    });
    if (!job) throw new Error("Job not found");

    // 2. Fetch Full Profile
    const profile = await db.query.profiles.findFirst({
        where: (table, { eq }) => eq(table.userId, userId)
    });
    if (!profile) throw new Error("Profile not found");

    const [userSkills, userExperience] = await Promise.all([
        db.query.skills.findMany({ where: (table, { eq }) => eq(table.profileId, profile.id) }),
        db.query.workExperience.findMany({ where: (table, { eq }) => eq(table.profileId, profile.id) }),
    ]);

    const fullProfile = {
        ...profile,
        skills: userSkills,
        workExperience: userExperience,
    };

    // 3. Generate Analysis
    const { generateGapAnalysis } = await import("./gap-service");
    const gapAnalysis = await generateGapAnalysis(job, fullProfile);

    // 4. Save to Match
    await db.update(jobMatches)
        .set({ gapAnalysis, calculatedAt: new Date() })
        .where(and(eq(jobMatches.jobId, jobId), eq(jobMatches.userId, userId)));

    return gapAnalysis;
}
