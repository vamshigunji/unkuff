'use server';

import { db } from "@/lib/db";
import { jobs } from "@/features/jobs/schema";
import { auth } from "@/auth";
import { KANBAN_COLUMNS, KanbanColumn, KanbanStatus } from "./types";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { jobMatches } from "@/features/matching/schema";

// Valid status values for drag-and-drop
const VALID_STATUSES: KanbanStatus[] = ['recommended', 'applied', 'interviewing', 'offer'];

// Zod schema for status validation
const updateJobStatusSchema = z.object({
    jobId: z.string().uuid(),
    status: z.enum(['recommended', 'applied', 'interviewing', 'offer']),
});

const deleteJobSchema = z.object({
    jobId: z.string().uuid(),
});


export async function getKanbanBoardData(): Promise<KanbanColumn[]> {
    const session = await auth();
    if (!session?.user?.id) {
        return KANBAN_COLUMNS.map(col => ({ ...col, jobs: [] }));
    }

    const userId = session.user.id;

    // 1. Fetch user criteria for filtering recommended jobs
    const criteria = await db.query.jobCriteria.findMany({
        where: (table, { eq, and }) => and(
            eq(table.userId, userId),
            eq(table.isActive, 1)
        ),
    });

    const activeTitles = criteria.flatMap(c => c.jobTitles.map(t => t.toLowerCase()));

    // 2. Fetch jobs
    const userJobs = await db.query.jobs.findMany({
        where: (table, { and, eq, inArray }) => and(
            eq(table.userId, userId),
            inArray(table.status, KANBAN_COLUMNS.map(c => c.id))
        ),
        orderBy: (jobs, { desc }) => [desc(jobs.createdAt)],
    });

    // 3. Fetch scores
    const matches = await db.query.jobMatches.findMany({
        where: eq(jobMatches.userId, userId),
    });
    const matchMap = new Map(matches.map(m => [m.jobId, m.score]));

    const columns: KanbanColumn[] = KANBAN_COLUMNS.map(col => {
        let jobsInCol = userJobs.filter(job => job.status === col.id);

        // STRICT MARRIAGE: Recommended column MUST match active criteria
        if (col.id === 'recommended') {
            if (activeTitles.length === 0) {
                jobsInCol = []; // No active criteria = No recommendations
            } else {
                jobsInCol = jobsInCol.filter(job =>
                    activeTitles.some(title => job.title.toLowerCase().includes(title))
                );
            }
        }

        const mappedJobs = jobsInCol.map(job => {
            const score = matchMap.get(job.id);
            const meta = (job.metadata as Record<string, any>) || {};
            return {
                ...job,
                metadata: {
                    ...meta,
                    score: score ?? meta.score // Fallback to existing metadata score
                }
            };
        });

        return {
            ...col,
            jobs: mappedJobs
        };
    });

    return columns;
}

/**
 * Update a job's status (for drag-and-drop pipeline management)
 * 
 * @param jobId - The job ID to update
 * @param status - The new status
 * @returns Standardized response { data: boolean | null, error: string | null }
 */
export async function updateJobStatus(
    jobId: string,
    status: KanbanStatus
): Promise<{ data: boolean | null; error: string | null }> {
    try {
        // Validate session
        const session = await auth();
        if (!session?.user?.id) {
            return { data: null, error: 'Unauthorized' };
        }

        // Validate input
        const validation = updateJobStatusSchema.safeParse({ jobId, status });
        if (!validation.success) {
            return { data: null, error: 'Invalid job ID or status' };
        }

        // Ensure status is valid for Kanban
        if (!VALID_STATUSES.includes(status)) {
            return { data: null, error: `Invalid status: ${status}` };
        }

        // Update the job status, ensuring it belongs to the current user
        const result = await db
            .update(jobs)
            .set({
                status,
                updatedAt: new Date()
            })
            .where(
                and(
                    eq(jobs.id, jobId),
                    eq(jobs.userId, session.user.id)
                )
            )
            .returning({ id: jobs.id });

        if (result.length === 0) {
            return { data: null, error: 'Job not found or access denied' };
        }

        // Revalidate the dashboard to reflect changes
        revalidatePath('/dashboard');

        return { data: true, error: null };
    } catch (error) {
        console.error('Failed to update job status:', error);
        return { data: null, error: 'Failed to update job status' };
    }
}

/**
 * Update candidate notes for a job
 * 
 * @param jobId - The job ID
 * @param notes - The notes text
 * @returns Standardized response
 */
export async function updateJobNotes(
    jobId: string,
    notes: string
): Promise<{ data: boolean | null; error: string | null }> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { data: null, error: 'Unauthorized' };
        }

        const result = await db
            .update(jobs)
            .set({
                notes,
                updatedAt: new Date()
            })
            .where(
                and(
                    eq(jobs.id, jobId),
                    eq(jobs.userId, session.user.id)
                )
            )
            .returning({ id: jobs.id });

        if (result.length === 0) {
            return { data: null, error: 'Job not found or access denied' };
        }

        return { data: true, error: null };
    } catch (error) {
        console.error('Failed to update job notes:', error);
        return { data: null, error: 'Failed to update job notes' };
    }
}

export async function deleteJob(
    jobId: string
): Promise<{ data: boolean | null; error: string | null }> {
    try {
        // Validate session
        const session = await auth();
        if (!session?.user?.id) {
            return { data: null, error: 'Unauthorized' };
        }

        // Validate input
        const validation = deleteJobSchema.safeParse({ jobId });
        if (!validation.success) {
            return { data: null, error: 'Invalid job ID' };
        }

        // Delete the job, ensuring it belongs to the current user
        const result = await db
            .delete(jobs)
            .where(
                and(
                    eq(jobs.id, jobId),
                    eq(jobs.userId, session.user.id)
                )
            )
            .returning({ id: jobs.id });

        if (result.length === 0) {
            return { data: null, error: 'Job not found or access denied' };
        }

        // Revalidate the dashboard to reflect changes
        revalidatePath('/dashboard');

        return { data: true, error: null };
    } catch (error) {
        console.error('Failed to delete job:', error);
        return { data: null, error: 'Failed to delete job' };
    }
}
