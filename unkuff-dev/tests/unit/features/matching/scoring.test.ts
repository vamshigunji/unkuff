
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateJobMatch, normalizeScore, batchScoring } from '@/features/matching/scoring-service';
import { db } from '@/lib/db';

vi.mock('@/lib/db', () => ({
    db: {
        execute: vi.fn(),
        query: {
            profiles: {
                findFirst: vi.fn(),
            },
        },
        insert: vi.fn(() => ({
            values: vi.fn(() => ({
                onConflictDoUpdate: vi.fn(() => ({
                    returning: vi.fn(),
                })),
            })),
        })),
    },
}));

vi.mock('@/features/matching/schema', () => ({
    jobMatches: {
        userId: 'user_id',
        jobId: 'job_id',
        score: 'score',
        rawSimilarity: 'raw_similarity',
    }
}));

describe('Scoring Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('normalizeScore', () => {
        it('should convert 0-1 similarity to 0-100 score', () => {
            expect(normalizeScore(0.85)).toBe(85);
            expect(normalizeScore(1)).toBe(100);
            expect(normalizeScore(0)).toBe(0);
        });

        it('should handle small deviations or precision issues', () => {
            expect(normalizeScore(0.856)).toBe(86); // Floor or round? Usually round.
        });
    });

    describe('calculateJobMatch', () => {
        it('should return null if profile has no embedding', async () => {
            (db.query.profiles.findFirst as any).mockResolvedValue({ bioEmbedding: null });
            const result = await calculateJobMatch('user-1', 'job-1');
            expect(result).toBeNull();
        });

        it('should execute vector similarity query and return score', async () => {
            (db.query.profiles.findFirst as any).mockResolvedValue({ bioEmbedding: [0.1, 0.2] });

            // Mock SQL execution result
            // Returns array of rows
            (db.execute as any).mockResolvedValue({
                rows: [{ id: 'job-1', similarity: 0.88 }],
                rowCount: 1
            });

            const result = await calculateJobMatch('user-1', 'job-1');

            expect(db.execute).toHaveBeenCalled();
            expect(result).toEqual({
                jobId: 'job-1',
                score: 88,
                rawSimilarity: 0.88
            });
        });
    });
});
