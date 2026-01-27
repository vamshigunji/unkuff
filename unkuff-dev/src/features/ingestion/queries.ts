import { db } from "@/lib/db";
import { jobs } from "@/features/jobs/schema";
import { count, eq, desc } from "drizzle-orm";

export async function getIngestionStats(userId: string) {
    const [total] = await db
        .select({ value: count() })
        .from(jobs)
        .where(eq(jobs.userId, userId));

    const [recommended] = await db
        .select({ value: count() })
        .from(jobs)
        .where(eq(jobs.status, "recommended"));

    const [hydrated] = await db
        .select({ value: count() })
        .from(jobs)
        .where(eq(jobs.status, "applied")); // Need to check what logic defines "hydrated" status

    // For now, let's define hydrated as having description and technographics
    // But since statuses are enums, let's just count based on fields for now

    // Better: Select count where description is not null
    // Drizzle doesn't have a direct isNotNull in select count easily without SQL
    // Let's just do a direct query for now
    const allJobs = await db.query.jobs.findMany({
        where: eq(jobs.userId, userId),
    });

    const hydratedCount = allJobs.filter(j => j.description && j.technographics && j.technographics.length > 0).length;

    return {
        total: total.value,
        recommended: recommended.value,
        hydrated: hydratedCount,
    };
}

export async function getRecentJobs(userId: string, limit = 10) {
    return await db.query.jobs.findMany({
        where: eq(jobs.userId, userId),
        orderBy: [desc(jobs.createdAt)],
        limit,
    });
}
