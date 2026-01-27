"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { tailoringRequestSchema } from "./schema";
import { auth } from "@/auth"; // Assuming auth setup
import { generateOptimizedResume } from "./service";
import { db } from "@/lib/db"; // Assuming db access
import { jobs } from "@/db/schema"; // Assuming jobs table
import { profiles, workExperience, skills, education } from "@/db/schema"; // Assuming profile tables
import { generatedResumes } from "./schema";
import { eq } from "drizzle-orm";

export type ActionState<T> = {
    data: T | null;
    error: string | null;
};

export async function generateTailoredResume(
    input: z.infer<typeof tailoringRequestSchema>
): Promise<ActionState<{ resumeId: string; score: number }>> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { data: null, error: "Unauthorized" };
        }

        // Input validation
        const validated = tailoringRequestSchema.safeParse(input);
        if (!validated.success) {
            return { data: null, error: "Invalid input parameters" };
        }

        // 1. Fetch Job Data
        const job = await db.query.jobs.findFirst({
            where: eq(jobs.id, validated.data.jobId)
        });

        if (!job) {
            return { data: null, error: "Job not found" };
        }

        // 2. Fetch Master Profile Data
        const profile = await db.query.profiles.findFirst({
            where: eq(profiles.userId, session.user.id),
            with: {
                workExperience: true,
                skills: true,
                education: true
            }
        });

        if (!profile) {
            return { data: null, error: "Master profile incomplete" };
        }

        // 3. Transform to Types (Adapter Layer)
        // 3. Transform to Types (Adapter Layer)
        const profileData = {
            bio: profile.bio || "",
            // @ts-ignore - DB types mismatch with service type due to relations inference
            workExperience: profile.workExperience || [],
            // @ts-ignore
            skills: profile.skills.map(s => ({ name: s.name })) || [],
            // @ts-ignore
            education: profile.education || []
        };

        const jobData = {
            title: job.title,
            description: job.description || "",
            company: job.company
        };


        // 4. Run Optimization Loop (Service Layer)
        const result = await generateOptimizedResume(profileData, jobData);

        // 5. Persist Result
        const [savedResume] = await db.insert(generatedResumes).values({
            userId: session.user.id,
            jobId: validated.data.jobId,
            content: result.resume,
            atsScore: result.score,
            templateId: validated.data.templateId || "default",
        }).returning();

        revalidatePath("/dashboard");

        return {
            data: { resumeId: savedResume.id, score: result.score },
            error: null
        };

    } catch (error) {
        console.error("Error generating tailored resume:", error);
        return { data: null, error: "Failed to generate tailored resume" };
    }
}
