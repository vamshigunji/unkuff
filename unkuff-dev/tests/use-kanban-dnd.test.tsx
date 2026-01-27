import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useKanbanDnd } from '@/features/dashboard/hooks/use-kanban-dnd';
import { KanbanColumn, SerializedJob } from '@/features/dashboard/types';

// Mock data
const mockJob1: SerializedJob = {
    id: 'job-1',
    userId: 'user-1',
    title: 'Frontend Developer',
    company: 'TechCorp',
    sourceUrl: 'https://example.com/job-1',
    sourceName: 'Indeed',
    sourceId: 'indeed-123',
    hash: 'hash-1',
    status: 'recommended',
    createdAt: '2026-01-25T00:00:00Z',
    updatedAt: '2026-01-25T00:00:00Z',
    postedAt: '2026-01-24T00:00:00Z',
    location: null,
    city: null,
    state: null,
    country: null,
    postalCode: null,
    latitude: null,
    longitude: null,
    workMode: 'remote',
    experienceLevel: 'mid-senior',
    employmentType: 'Full-time',
    salarySnippet: '$120k - $150k',
    minSalary: 120000,
    maxSalary: 150000,
    salaryCurrency: 'USD',
    salaryUnit: 'Year',
    description: null,
    descriptionHtml: null,
    snippet: null,
    skills: null,
    benefits: null,
    qualifications: null,
    responsibilities: null,
    applyUrl: null,
    sourceActorId: null,
    applicationsCount: null,
    recruiterName: null,
    recruiterUrl: null,
    companyWebsite: null,
    companyIndustry: null,
    companyLogo: null,
    companyRevenue: null,
    companyEmployeesCount: null,
    companyRating: null,
    companyRatingsCount: null,
    companyCeoName: null,
    companyDescription: null,
    technographics: null,
    embedding: null,
    metadata: { score: 85, atsScore: 78 },
    rawContent: null,
};

const mockJob2: SerializedJob = {
    ...mockJob1,
    id: 'job-2',
    title: 'Backend Developer',
    company: 'DataCorp',
    status: 'applied',
};

const mockJob3: SerializedJob = {
    ...mockJob1,
    id: 'job-3',
    title: 'Full Stack Developer',
    company: 'StartupCo',
    status: 'recommended',
};

const mockColumns: KanbanColumn<SerializedJob>[] = [
    { id: 'recommended', label: 'For You', jobs: [mockJob1, mockJob3] },
    { id: 'applied', label: 'Applied', jobs: [mockJob2] },
    { id: 'interviewing', label: 'Interviewing', jobs: [] },
    { id: 'offer', label: 'Offers', jobs: [] },
];

describe('useKanbanDnd', () => {
    describe('initialization', () => {
        it('initializes with provided columns', () => {
            const { result } = renderHook(() => useKanbanDnd(mockColumns));

            expect(result.current.columns).toEqual(mockColumns);
            expect(result.current.activeId).toBeNull();
            expect(result.current.isDragging).toBe(false);
        });

        it('updates columns when prop changes', () => {
            const { result, rerender } = renderHook(
                ({ columns }) => useKanbanDnd(columns),
                { initialProps: { columns: mockColumns } }
            );

            const newColumns = [
                ...mockColumns.slice(0, 1),
                { ...mockColumns[1], jobs: [] },
                ...mockColumns.slice(2),
            ];

            rerender({ columns: newColumns });

            expect(result.current.columns[1].jobs).toHaveLength(0);
        });
    });

    describe('drag state management', () => {
        it('sets activeId when drag starts', () => {
            const { result } = renderHook(() => useKanbanDnd(mockColumns));

            act(() => {
                result.current.handleDragStart({ active: { id: 'job-1' } } as any);
            });

            expect(result.current.activeId).toBe('job-1');
            expect(result.current.isDragging).toBe(true);
        });

        it('clears activeId when drag ends', () => {
            const { result } = renderHook(() => useKanbanDnd(mockColumns));

            act(() => {
                result.current.handleDragStart({ active: { id: 'job-1' } } as any);
            });

            expect(result.current.isDragging).toBe(true);

            act(() => {
                result.current.handleDragEnd({
                    active: { id: 'job-1' },
                    over: null
                } as any);
            });

            expect(result.current.activeId).toBeNull();
            expect(result.current.isDragging).toBe(false);
        });

        it('clears activeId when drag is cancelled', () => {
            const { result } = renderHook(() => useKanbanDnd(mockColumns));

            act(() => {
                result.current.handleDragStart({ active: { id: 'job-1' } } as any);
            });

            act(() => {
                result.current.handleDragCancel();
            });

            expect(result.current.activeId).toBeNull();
            expect(result.current.isDragging).toBe(false);
        });
    });

    describe('column movement', () => {
        it('moves job between columns on drag end', async () => {
            const mockOnMove = vi.fn().mockResolvedValue({ data: true, error: null });
            const { result } = renderHook(() => useKanbanDnd(mockColumns, mockOnMove));

            // Simulate drag from 'recommended' to 'applied'
            await act(async () => {
                result.current.handleDragStart({ active: { id: 'job-1' } } as any);
            });

            await act(async () => {
                await result.current.handleDragEnd({
                    active: { id: 'job-1' },
                    over: { id: 'applied' },
                } as any);
            });

            expect(mockOnMove).toHaveBeenCalledWith('job-1', 'applied');
        });

        it('does not call onMove when dropped in same column', async () => {
            const mockOnMove = vi.fn().mockResolvedValue({ data: true, error: null });
            const { result } = renderHook(() => useKanbanDnd(mockColumns, mockOnMove));

            await act(async () => {
                result.current.handleDragStart({ active: { id: 'job-1' } } as any);
            });

            await act(async () => {
                await result.current.handleDragEnd({
                    active: { id: 'job-1' },
                    over: { id: 'recommended' },
                } as any);
            });

            // Should not call onMove when dropped in same column
            expect(mockOnMove).not.toHaveBeenCalled();
        });

        it('does not call onMove when dropped outside columns', async () => {
            const mockOnMove = vi.fn().mockResolvedValue({ data: true, error: null });
            const { result } = renderHook(() => useKanbanDnd(mockColumns, mockOnMove));

            await act(async () => {
                result.current.handleDragStart({ active: { id: 'job-1' } } as any);
            });

            await act(async () => {
                await result.current.handleDragEnd({
                    active: { id: 'job-1' },
                    over: null,
                } as any);
            });

            expect(mockOnMove).not.toHaveBeenCalled();
        });
    });

    describe('active job lookup', () => {
        it('returns active job when dragging', () => {
            const { result } = renderHook(() => useKanbanDnd(mockColumns));

            act(() => {
                result.current.handleDragStart({ active: { id: 'job-1' } } as any);
            });

            expect(result.current.activeJob).toEqual(mockJob1);
        });

        it('returns null when not dragging', () => {
            const { result } = renderHook(() => useKanbanDnd(mockColumns));

            expect(result.current.activeJob).toBeNull();
        });
    });

    describe('sensors configuration', () => {
        it('returns configured sensors', () => {
            const { result } = renderHook(() => useKanbanDnd(mockColumns));

            expect(result.current.sensors).toBeDefined();
            expect(Array.isArray(result.current.sensors)).toBe(true);
        });
    });
});
