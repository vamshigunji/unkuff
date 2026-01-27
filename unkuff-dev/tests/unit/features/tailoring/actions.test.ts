import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateTailoredResume } from '@/features/tailoring/actions';
import { tailoringRequestSchema } from '@/features/tailoring/schema';
import * as authLib from '@/auth';

// Mock dependencies BEFORE imports
vi.mock('@/lib/db', () => ({
    db: {
        query: {
            jobs: { findFirst: vi.fn() },
            profiles: { findFirst: vi.fn() }
        },
        insert: vi.fn(() => ({
            values: vi.fn(() => ({
                returning: vi.fn()
            }))
        }))
    }
}));

vi.mock('@/auth', () => ({
    auth: vi.fn(),
}));

vi.mock('@/features/tailoring/service', () => ({
    generateOptimizedResume: vi.fn()
}));

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn()
}));


describe('Tailoring Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('generateTailoredResume', () => {
        it('should return unauthorized error if no session', async () => {
            vi.mocked(authLib.auth).mockResolvedValue(null);

            const result = await generateTailoredResume({ jobId: '123e4567-e89b-12d3-a456-426614174000' });

            expect(result.error).toBe('Unauthorized');
            expect(result.data).toBeNull();
        });

        it('should return error for invalid input', async () => {
            vi.mocked(authLib.auth).mockResolvedValue({ user: { id: 'user-1' } } as any);

            // @ts-ignore - explicitly testing invalid input
            const result = await generateTailoredResume({ jobId: 'invalid-uuid' });

            expect(result.error).toBe('Invalid input parameters');
            expect(result.data).toBeNull();
        });

        it('should call service and return result when authorized', async () => {
            vi.mocked(authLib.auth).mockResolvedValue({ user: { id: 'user-1' } } as any);

            const validJobId = '123e4567-e89b-12d3-a456-426614174000';

            // Setup DB mocks for success path
            // @ts-ignore
            const { db } = await import('@/lib/db');
            vi.mocked(db.query.jobs.findFirst).mockResolvedValue({
                id: validJobId,
                title: "Dev",
                company: "Corp",
                description: "Desc"
            });

            // @ts-ignore
            vi.mocked(db.query.profiles.findFirst).mockResolvedValue({
                id: "profile-1",
                bio: "Bio",
                workExperience: [],
                skills: [{ name: "React" }],
                education: []
            });

            // Mock service return
            const mockService = await import('@/features/tailoring/service');
            vi.mocked(mockService.generateOptimizedResume).mockResolvedValue({
                resume: {
                    personalInfo: { fullName: "Test", email: "test@test.com" },
                    summary: "Sum",
                    experience: [],
                    education: [],
                    skills: ["React"]
                },
                score: 98,
                passes: 1
            });

            // Mock DB Insert return
            // @ts-ignore
            vi.mocked(db.insert).mockReturnValue({
                values: vi.fn().mockReturnValue({
                    returning: vi.fn().mockResolvedValue([{ id: 'resume-123' }])
                })
            });

            const result = await generateTailoredResume({ jobId: validJobId });

            expect(result.error).toBeNull();
            expect(result.data).toEqual({ resumeId: 'resume-123', score: 98 });
        });
    });
});

describe('Tailoring Schema', () => {
    it('should validate correct request payload', () => {
        const validPayload = {
            jobId: '123e4567-e89b-12d3-a456-426614174000',
            templateId: 'modern-1'
        };

        const result = tailoringRequestSchema.safeParse(validPayload);
        expect(result.success).toBe(true);
    });

    it('should reject invalid uuid for jobId', () => {
        const invalidPayload = {
            jobId: 'not-a-uuid',
        };

        const result = tailoringRequestSchema.safeParse(invalidPayload);
        expect(result.success).toBe(false);
    });
});

