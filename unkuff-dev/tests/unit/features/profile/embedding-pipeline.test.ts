
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { updateBioEmbedding, aggregateProfileText } from '@/features/profile/actions';
import { generateEmbedding } from '@/lib/embeddings';
import { db } from '@/lib/db';

// Mock dependencies
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));
vi.mock('@/lib/embeddings', () => ({
    generateEmbedding: vi.fn(),
}));

vi.mock('@/auth', () => ({
    auth: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
    db: {
        query: {
            profiles: {
                findFirst: vi.fn(),
            },
            skills: { findMany: vi.fn() },
            workExperience: { findMany: vi.fn() },
        },
        update: vi.fn(() => ({
            set: vi.fn(() => ({
                where: vi.fn(),
            })),
        })),
    },
}));

// Mock encryption
vi.mock('@/lib/encryption', () => ({
    decrypt: vi.fn((val) => val), // Mock decrypt to return value as is
    encrypt: vi.fn((val) => val),
}));

import { auth } from '@/auth';

describe('Profile Embedding Pipeline', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('aggregateProfileText', () => {
        it('should combine summary, skills, and experience', async () => {
            const profile = {
                // bio removed from UI - no longer a primary field
                summary: 'Summary text describing professional background',
                skills: [{ name: 'React' }, { name: 'Node.js' }],
                workExperience: [
                    { title: 'Dev', company: 'Tech Inc', description: 'Coding' }
                ],
                educations: [],
                certifications: [],
                accomplishments: [],
            };

            const result = await aggregateProfileText(profile);
            expect(result).toContain('Summary: Summary text describing professional background');
            expect(result).toContain('Skills: React, Node.js');
            expect(result).toContain('Dev at Tech Inc. Coding');
        });

        it('should still include bio for backward compatibility if present', async () => {
            const profile = {
                bio: 'Legacy bio text',
                summary: 'Summary text',
                skills: [],
                workExperience: [],
            };

            const result = await aggregateProfileText(profile);
            expect(result).toContain('Bio: Legacy bio text');
            expect(result).toContain('Summary: Summary text');
        });
    });

    describe('updateBioEmbedding', () => {
        it('should fail if user is not authenticated', async () => {
            (auth as any).mockResolvedValue(null);
            const result = await updateBioEmbedding('user-123');
            expect(result.error).toBe('Unauthorized');
        });

        it('should fail if profile not found', async () => {
            (auth as any).mockResolvedValue({ user: { id: 'user-123' } });
            (db.query.profiles.findFirst as any).mockResolvedValue(null);

            const result = await updateBioEmbedding('user-123');
            expect(result.error).toBe('Profile not found');
        });

        it('should generate and save embedding for valid profile', async () => {
            (auth as any).mockResolvedValue({ user: { id: 'user-123' } });

            // Mock profile with relations
            (db.query.profiles.findFirst as any).mockResolvedValue({
                id: 'profile-1',
                userId: 'user-123',
                bio: 'Software Engineer',
                summary: 'Experienced dev',
                // Relations fetched separately now
            });
            (db.query.skills.findMany as any).mockResolvedValue([{ name: 'React' }, { name: 'TypeScript' }]);
            (db.query.workExperience.findMany as any).mockResolvedValue([{ title: 'Senior Dev', company: 'Google', description: 'Built AI stuff' }]);

            const mockEmbedding = Array(1536).fill(0.5);
            (generateEmbedding as any).mockResolvedValue(mockEmbedding);

            const result = await updateBioEmbedding('user-123');

            expect(result.data).toBe(true);
            expect(generateEmbedding).toHaveBeenCalled();

            const updateFn = db.update;
            expect(updateFn).toHaveBeenCalled();
        });
    });
});
