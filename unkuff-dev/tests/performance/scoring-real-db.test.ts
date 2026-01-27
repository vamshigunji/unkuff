
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '@/lib/db';
import { profiles } from '@/features/profile/schema';
import { users } from '@/features/auth/schema';
import { jobs } from '@/features/jobs/schema';
import { jobMatches } from '@/features/matching/schema';
import { calculateJobMatch, batchScoring } from '@/features/matching/scoring-service';
import { eq } from 'drizzle-orm';

// Helper to generate random embedding vector string
function generateRandomVectorString(dim: number = 1536): unknown {
    const arr = Array.from({ length: dim }, () => Math.random() - 0.5);
    return `[${arr.join(',')}]` as unknown; // Cast to unknown to trick Drizzle type check if needed, or string
}

const TEST_USER_ID = 'perf-bench-user-' + Date.now();
const JOB_COUNT = 100;
const TIMEOUT = 30000; // 30s setup time

describe('Scoring Engine Performance (Real DB)', () => {
    // Skip if no DB connection (fallback for CI without sidecar)
    if (!process.env.DATABASE_URL) {
        it.skip('Skipping performance tests - No DATABASE_URL', () => { });
        return;
    }

    let jobIds: string[] = [];

    beforeAll(async () => {
        // 0. Create Test User (Foreign Key Requirement)
        await db.insert(users).values({
            id: TEST_USER_ID,
            name: 'Bench User',
            email: `bench-${Date.now()}@test.com`
        });

        // 1. Create Test User Profile with Embedding
        await db.insert(profiles).values({
            userId: TEST_USER_ID,
            bioEmbedding: generateRandomVectorString() as any,
            name: 'Bench User',
            bio: 'Bench Bio'
        } as any);

        // 2. Create Bulk Jobs with Embeddings
        const jobValues = Array.from({ length: JOB_COUNT }).map((_, i) => ({
            userId: TEST_USER_ID,
            title: `Bench Job ${i}`,
            company: 'Bench Corp',
            description: 'Bench Desc',
            status: 'recommended' as const,
            embedding: generateRandomVectorString() as any,
            hash: `bench-${Date.now()}-${i}`,
            sourceUrl: 'https://example.com/bench-job',
            sourceName: 'bench',
            sourceId: `bench-${i}`
        }));

        const insertedJobs = await db.insert(jobs).values(jobValues as any[]).returning({ id: jobs.id });
        jobIds = insertedJobs.map(j => j.id);

        console.log(`Seeded ${jobIds.length} jobs for performance testing`);
    }, TIMEOUT);

    afterAll(async () => {
        // Cleanup
        await db.delete(jobMatches).where(eq(jobMatches.userId, TEST_USER_ID));
        await db.delete(jobs).where(eq(jobs.userId, TEST_USER_ID));
        await db.delete(profiles).where(eq(profiles.userId, TEST_USER_ID));
        await db.delete(users).where(eq(users.id, TEST_USER_ID));
    });

    it('AC6.1: Single score calculation should be < 100ms', async () => {
        const start = performance.now();

        await calculateJobMatch(TEST_USER_ID, jobIds[0]);

        const end = performance.now();
        const duration = end - start;

        console.log(`Single Score Duration: ${duration.toFixed(2)}ms`);
        expect(duration).toBeLessThan(100);
    });

    it('AC6.2: Batch scoring of 100 jobs should be < 5 seconds', async () => {
        const start = performance.now();

        const result = await batchScoring(TEST_USER_ID);

        const end = performance.now();
        const duration = end - start;

        console.log(`Batch Score (100 jobs) Duration: ${duration.toFixed(2)}ms`);
        console.log(`Processed: ${result.count}`);

        expect(result.count).toBe(JOB_COUNT); // Should process all
        expect(duration).toBeLessThan(5000); // 5s limit
    }, 10000); // Test timeout 10s
});
