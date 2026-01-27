
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateJobEmbedding, aggregateJobText, updateJobEmbedding } from '@/features/ingestion/embedding-service';
import { generateEmbedding } from '@/lib/embeddings';
import { db } from '@/lib/db';

vi.mock('@/lib/embeddings', () => ({
    generateEmbedding: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
    db: {
        update: vi.fn(() => ({
            set: vi.fn(() => ({
                where: vi.fn(),
            })),
        })),
    },
}));

describe('Job Embedding Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('aggregateJobText', () => {
        it('should combine title, description, skills, and qualifications', () => {
            const job = {
                title: 'Frontend Engineer',
                description: 'React expert needed.',
                skills: ['React', 'TypeScript'],
                qualifications: ['BS CS', '3+ years exp'],
                company: 'Vercel',
            };
            // @ts-ignore
            const text = aggregateJobText(job);
            expect(text).toContain('Title: Frontend Engineer');
            expect(text).toContain('Description: React expert needed.');
            expect(text).toContain('Skills: React, TypeScript');
            expect(text).toContain('Qualifications: BS CS, 3+ years exp');
        });

        it('should handle missing optional fields', () => {
            const job = {
                title: 'Simple Job',
                description: 'Just do it',
            };
            // @ts-ignore
            const text = aggregateJobText(job);
            expect(text).toContain('Title: Simple Job');
            expect(text).not.toContain('Skills:');
        });
    });

    describe('generateJobEmbedding', () => {
        it('should generate and return embedding', async () => {
            const job = {
                id: 'job-1',
                title: 'Job',
                description: 'Desc',
            };
            const mockEmbedding = Array(1536).fill(0.9);
            (generateEmbedding as any).mockResolvedValue(mockEmbedding);

            // @ts-ignore
            const result = await generateJobEmbedding(job);

            expect(generateEmbedding).toHaveBeenCalled();
            expect(result).toBe(mockEmbedding);
        });

        it('should throw if description is missing', async () => {
            const job = { title: 'Job' }; // No description
            // @ts-ignore
            await expect(generateJobEmbedding(job)).rejects.toThrow('Job description is required');
        });
    });

    describe('updateJobEmbedding', () => {
        it('should fetch job, generate embedding and update db', async () => {
            (db as any).query = {
                jobs: {
                    findFirst: vi.fn(),
                }
            };

            (db.query.jobs.findFirst as any).mockResolvedValue({
                id: 'job-1',
                userId: 'user-1',
                description: 'Full desc',
                title: 'Title'
            });

            const mockEmbedding = [0.1, 0.2];
            (generateEmbedding as any).mockResolvedValue(mockEmbedding);

            await updateJobEmbedding('user-1', 'job-1');

            expect(db.query.jobs.findFirst).toHaveBeenCalled();
            expect(generateEmbedding).toHaveBeenCalled();
            expect(db.update).toHaveBeenCalled();
        });

        it('should skip if job has no description', async () => {
            (db as any).query = {
                jobs: {
                    findFirst: vi.fn(),
                }
            };
            (db.query.jobs.findFirst as any).mockResolvedValue({
                id: 'job-1',
                description: null
            });

            await updateJobEmbedding('user-1', 'job-1');
            expect(generateEmbedding).not.toHaveBeenCalled();
            expect(db.update).not.toHaveBeenCalled();
        });
    });
});
