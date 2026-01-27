import { generateEmbedding } from "@/lib/embeddings";
import { type Job, jobs } from "@/features/jobs/schema";
import { db } from "@/lib/db";
import { eq, and } from "drizzle-orm";

export function aggregateJobText(job: Partial<Job>): string {
    const parts: string[] = [];

    if (job.title) parts.push(`Title: ${job.title}`);
    if (job.description) parts.push(`Description: ${job.description}`);

    // Skills
    if (job.skills && job.skills.length > 0) {
        parts.push(`Skills: ${job.skills.join(", ")}`);
    }

    // Qualifications
    if (job.qualifications && job.qualifications.length > 0) {
        parts.push(`Qualifications: ${job.qualifications.join(", ")}`);
    }

    if (job.technographics && job.technographics.length > 0) {
        parts.push(`Stack: ${job.technographics.join(", ")}`);
    }

    return parts.join("\n\n");
}

/**
 * Generates an embedding for a job.
 * Enforces requirement that job must have a description.
 */
export async function generateJobEmbedding(job: Partial<Job>): Promise<number[]> {
    if (!job.description || job.description.trim().length === 0) {
        throw new Error("Job description is required for embedding");
    }

    const text = aggregateJobText(job);
    return await generateEmbedding(text);
}

/**
 * Orchestrates the embedding generation and persistence for a specific job.
 * Intended to be called as a background/fire-and-forget task.
 * 
 * TODO: [Review] Use after() (Next.js 15) or waitUntil() for Vercel/Serverless reliability
 */
export async function updateJobEmbedding(userId: string, jobId: string): Promise<void> {
    try {
        const job = await db.query.jobs.findFirst({
            where: and(eq(jobs.id, jobId), eq(jobs.userId, userId)),
        });

        if (!job || !job.description) return; // Skip if no job or no description (Lazy)

        // Generate embedding
        const embedding = await generateJobEmbedding(job);

        // Update DB
        await db.update(jobs)
            .set({
                embedding,
                updatedAt: new Date()
            })
            .where(eq(jobs.id, jobId));

        // TODO: Queue matching/scoring if needed (Task 7)

    } catch (error) {
        console.error(`[JobEmbedding] Failed for job ${jobId}:`, error);
        // Silent failure for background task, or log to monitoring
    }
}
