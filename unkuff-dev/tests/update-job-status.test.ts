import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateJobStatus } from '@/features/dashboard/actions';

// Mock dependencies
vi.mock('@/auth', () => ({
    auth: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
    db: {
        update: vi.fn(() => ({
            set: vi.fn(() => ({
                where: vi.fn(() => ({
                    returning: vi.fn(),
                })),
            })),
        })),
    },
}));

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

describe('updateJobStatus', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('authentication', () => {
        it('returns error when user is not authenticated', async () => {
            const { auth } = await import('@/auth');
            (auth as any).mockResolvedValue(null);

            const result = await updateJobStatus('123e4567-e89b-12d3-a456-426614174000', 'applied');

            expect(result).toEqual({
                data: null,
                error: 'Unauthorized',
            });
        });

        it('returns error when session has no user id', async () => {
            const { auth } = await import('@/auth');
            (auth as any).mockResolvedValue({ user: {} });

            const result = await updateJobStatus('123e4567-e89b-12d3-a456-426614174000', 'applied');

            expect(result).toEqual({
                data: null,
                error: 'Unauthorized',
            });
        });
    });

    describe('validation', () => {
        it('returns error for invalid job ID format', async () => {
            const { auth } = await import('@/auth');
            (auth as any).mockResolvedValue({ user: { id: 'user-1' } });

            const result = await updateJobStatus('invalid-uuid', 'applied');

            expect(result).toEqual({
                data: null,
                error: 'Invalid job ID or status',
            });
        });

        it('returns error for invalid status', async () => {
            const { auth } = await import('@/auth');
            (auth as any).mockResolvedValue({ user: { id: 'user-1' } });

            // TypeScript wouldn't allow this, but testing runtime validation
            const result = await updateJobStatus(
                '123e4567-e89b-12d3-a456-426614174000',
                'invalid-status' as any
            );

            expect(result).toEqual({
                data: null,
                error: 'Invalid job ID or status',
            });
        });
    });

    describe('success cases', () => {
        it('updates job status and returns success', async () => {
            const { auth } = await import('@/auth');
            const { db } = await import('@/lib/db');
            const { revalidatePath } = await import('next/cache');

            (auth as any).mockResolvedValue({ user: { id: 'user-1' } });

            const mockReturning = vi.fn().mockResolvedValue([{ id: '123e4567-e89b-12d3-a456-426614174000' }]);
            const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
            const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
            (db.update as any).mockReturnValue({ set: mockSet });

            const result = await updateJobStatus('123e4567-e89b-12d3-a456-426614174000', 'applied');

            expect(result).toEqual({
                data: true,
                error: null,
            });
            expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
        });

        it('returns error when job not found or access denied', async () => {
            const { auth } = await import('@/auth');
            const { db } = await import('@/lib/db');

            (auth as any).mockResolvedValue({ user: { id: 'user-1' } });

            const mockReturning = vi.fn().mockResolvedValue([]);
            const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
            const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
            (db.update as any).mockReturnValue({ set: mockSet });

            const result = await updateJobStatus('123e4567-e89b-12d3-a456-426614174000', 'applied');

            expect(result).toEqual({
                data: null,
                error: 'Job not found or access denied',
            });
        });
    });

    describe('status values', () => {
        const validStatuses = ['recommended', 'applied', 'interviewing', 'offer'] as const;

        it.each(validStatuses)('accepts valid status: %s', async (status) => {
            const { auth } = await import('@/auth');
            const { db } = await import('@/lib/db');

            (auth as any).mockResolvedValue({ user: { id: 'user-1' } });

            const mockReturning = vi.fn().mockResolvedValue([{ id: '123e4567-e89b-12d3-a456-426614174000' }]);
            const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
            const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
            (db.update as any).mockReturnValue({ set: mockSet });

            const result = await updateJobStatus('123e4567-e89b-12d3-a456-426614174000', status);

            expect(result.data).toBe(true);
            expect(result.error).toBeNull();
        });
    });
});
