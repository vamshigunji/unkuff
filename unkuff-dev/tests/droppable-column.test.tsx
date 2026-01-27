import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DroppableColumn } from '@/features/dashboard/components/droppable-column';
import { KanbanColumn, SerializedJob } from '@/features/dashboard/types';

// Mock dnd-kit hooks
vi.mock('@dnd-kit/core', () => ({
    useDroppable: vi.fn(() => ({
        isOver: false,
        setNodeRef: vi.fn(),
    })),
}));

vi.mock('@dnd-kit/sortable', () => ({
    SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    verticalListSortingStrategy: {},
    useSortable: vi.fn(() => ({
        attributes: { 'aria-describedby': 'dnd-description', role: 'button' },
        listeners: { onPointerDown: vi.fn(), onKeyDown: vi.fn() },
        setNodeRef: vi.fn(),
        transform: null,
        transition: null,
        isDragging: false,
    })),
    CSS: {
        Transform: {
            toString: vi.fn(() => ''),
        },
    },
}));

const mockJob: SerializedJob = {
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

const mockColumn: KanbanColumn<SerializedJob> = {
    id: 'recommended',
    label: 'For You',
    jobs: [mockJob],
};

const emptyColumn: KanbanColumn<SerializedJob> = {
    id: 'applied',
    label: 'Applied',
    jobs: [],
};

describe('DroppableColumn', () => {
    describe('rendering', () => {
        it('renders column label', () => {
            render(<DroppableColumn column={mockColumn} />);

            expect(screen.getByText('For You')).toBeInTheDocument();
        });

        it('renders job count badge', () => {
            render(<DroppableColumn column={mockColumn} />);

            expect(screen.getByText('1')).toBeInTheDocument();
        });

        it('renders empty state when no jobs', () => {
            render(<DroppableColumn column={emptyColumn} />);

            expect(screen.getByText('No jobs yet')).toBeInTheDocument();
        });

        it('renders job cards for each job', () => {
            render(<DroppableColumn column={mockColumn} />);

            expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
            expect(screen.getByText('TechCorp')).toBeInTheDocument();
        });
    });

    describe('drop zone behavior', () => {
        it('has data-column-id attribute for drop detection', () => {
            render(<DroppableColumn column={mockColumn} />);

            const column = screen.getByTestId('droppable-column');
            expect(column).toHaveAttribute('data-column-id', 'recommended');
        });

        it('applies highlight when being dragged over', async () => {
            const { useDroppable } = await import('@dnd-kit/core');
            (useDroppable as any).mockReturnValueOnce({
                isOver: true,
                setNodeRef: vi.fn(),
            });

            render(<DroppableColumn column={mockColumn} />);

            const column = screen.getByTestId('droppable-column');
            expect(column).toHaveClass('ring-2');
        });
    });

    describe('accessibility', () => {
        it('has aria-label for column region', () => {
            render(<DroppableColumn column={mockColumn} />);

            const column = screen.getByTestId('droppable-column');
            expect(column).toHaveAttribute('aria-label', 'For You column with 1 jobs');
        });
    });
});
