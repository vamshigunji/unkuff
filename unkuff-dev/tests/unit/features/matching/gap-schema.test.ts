
import { expect, test, describe } from 'vitest';
import { type NewJobMatch } from '@/features/matching/schema';

describe('Gap Analysis Schema', () => {
    test('JobMatch type should support gap_analysis structure', () => {
        const gapData = {
            gaps: [
                {
                    missing: 'React Native',
                    closest_match: 'React Web Experience',
                    reason: 'Has React but not Native',
                },
            ],
        };

        // This verification ensures the schema has been updated to include gapAnalysis
        const matchInput: Partial<NewJobMatch> = {
            userId: 'u1',
            jobId: 'j1',
            score: 50,
            // This property will cause a TS error until schema.ts is updated
            gapAnalysis: gapData,
        };

        expect(matchInput.gapAnalysis).toBeDefined();
        expect((matchInput.gapAnalysis as any).gaps).toHaveLength(1);
    });
});
