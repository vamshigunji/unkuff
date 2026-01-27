
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { analyzeJobGaps } from '@/features/matching/actions';
import { db } from '@/lib/db';

// Mock dependencies
vi.mock('@/auth', () => ({
    auth: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
    db: {
        query: {
            jobMatches: { findFirst: vi.fn() },
            jobs: { findFirst: vi.fn() },
            profiles: { findFirst: vi.fn() },
            workExperience: { findMany: vi.fn() },
            projects: { findMany: vi.fn() },
            skills: { findMany: vi.fn() },
        },
        insert: vi.fn(() => ({ values: vi.fn(() => ({ onConflictDoUpdate: vi.fn() })) })),
    },
}));

vi.mock('@/features/matching/gap-service', () => ({
    generateGapAnalysis: vi.fn(),
}));

import { auth } from '@/auth';
import { generateGapAnalysis } from '@/features/matching/gap-service';

describe('Matching Actions - analyzeJobGaps', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('should return existing analysis if present', async () => {
        (auth as any).mockResolvedValue({ user: { id: 'u1' } });
        (db.query.jobMatches.findFirst as any).mockResolvedValue({
            gapAnalysis: { gaps: [] }
        });

        const result = await analyzeJobGaps('j1');

        expect(result.data).toBeDefined();
        expect(generateGapAnalysis).not.toHaveBeenCalled();
    });

    test('should generate and save analysis if missing', async () => {
        (auth as any).mockResolvedValue({ user: { id: 'u1' } });
        (db.query.jobMatches.findFirst as any).mockResolvedValue(null);
        (db.query.jobs.findFirst as any).mockResolvedValue({ id: 'j1', title: 'Dev' });

        // Mock profile with relations pre-loaded
        (db.query.profiles.findFirst as any).mockResolvedValue({
            id: 'p1',
            userId: 'u1',
            workExperience: [],
            projects: [],
            skills: []
        });

        const mockAnalysis = { gaps: [{ missing: 'skill' }] };
        (generateGapAnalysis as any).mockResolvedValue(mockAnalysis);

        const result = await analyzeJobGaps('j1');

        expect(result.data).toEqual(mockAnalysis);
        expect(db.insert).toHaveBeenCalled();
    });
});
