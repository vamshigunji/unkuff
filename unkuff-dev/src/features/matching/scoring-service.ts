
import { db } from "@/lib/db";
import { profiles } from "@/features/profile/schema";
import { jobs } from "@/features/jobs/schema";
import { jobMatches } from "./schema";
import { eq, sql, and, isNotNull } from "drizzle-orm";

// Shared constants for score thresholds (used in UI and Logic)
export { SCORE_HIGH_THRESHOLD, SCORE_GOOD_THRESHOLD } from "./constants";


export function normalizeScore(similarity: number): number {
    const score = Math.round(similarity * 100);
    return Math.max(0, Math.min(100, score));
}

export async function calculateJobMatch(userId: string, jobId: string) {
    // 1. Get User Profile Embedding
    const profile = await db.query.profiles.findFirst({
        where: eq(profiles.userId, userId),
        columns: { bioEmbedding: true }
    });

    if (!profile || !profile.bioEmbedding) {
        return null;
    }

    // Drizzle might return vector as string or array depending on driver config
    const vectorData = typeof profile.bioEmbedding === 'string'
        ? JSON.parse(profile.bioEmbedding)
        : profile.bioEmbedding;

    const embeddingString = `[${vectorData.join(',')}]`;

    // 2. Calculate Similarity
    const result = await db.execute(sql`
        SELECT 
            id, 
            1 - (embedding <=> ${embeddingString}::vector) as similarity
        FROM ${jobs}
        WHERE id = ${jobId}
        AND embedding IS NOT NULL
        LIMIT 1
    `);

    if (result.rowCount === 0) return null;

    const row = result.rows[0];
    const similarity = Number(row.similarity);
    const score = normalizeScore(similarity);

    // 3. Persist
    await db.insert(jobMatches).values({
        userId,
        jobId,
        score,
        rawSimilarity: similarity,
        calculatedAt: new Date()
    }).onConflictDoUpdate({
        target: [jobMatches.userId, jobMatches.jobId],
        set: {
            score,
            rawSimilarity: similarity,
            calculatedAt: new Date()
        }
    });

    return {
        jobId,
        score,
        rawSimilarity: similarity
    };
}

export async function batchScoring(userId: string) {
    // 1. Get User Profile Embedding
    const profile = await db.query.profiles.findFirst({
        where: eq(profiles.userId, userId),
        columns: { bioEmbedding: true }
    });

    if (!profile || !profile.bioEmbedding) {
        return { count: 0 };
    }

    // Drizzle might return vector as string or array depending on driver config
    const vectorData = typeof profile.bioEmbedding === 'string'
        ? JSON.parse(profile.bioEmbedding)
        : profile.bioEmbedding;

    const embeddingString = `[${vectorData.join(',')}]`;

    // 2. Batch Update via SQL
    // Calculate similarity, normalize to score, insert/upsert
    // Note: gen_random_uuid() requires Postgres 13+ or pgcrypto
    const result = await db.execute(sql`
        INSERT INTO ${jobMatches} (id, user_id, job_id, score, raw_similarity, calculated_at)
        SELECT 
            gen_random_uuid() as id,
            ${userId}::text as user_id, 
            id as job_id,
            ROUND((1 - (embedding <=> ${embeddingString}::vector)) * 100) as score,
            (1 - (embedding <=> ${embeddingString}::vector)) as raw_similarity,
            NOW()
        FROM ${jobs}
        WHERE embedding IS NOT NULL AND status IN ('open', 'recommended')
        ON CONFLICT (user_id, job_id) 
        DO UPDATE SET
            score = EXCLUDED.score,
            raw_similarity = EXCLUDED.raw_similarity,
            calculated_at = EXCLUDED.calculated_at
    `);

    return { count: result.rowCount || 0 };
}
