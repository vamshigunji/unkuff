import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DraggableJobCard } from '@/features/dashboard/components/draggable-job-card';
import { SerializedJob } from '@/features/dashboard/types';

// Mock dnd-kit's useSortable hook
vi.mock('@dnd-kit/sortable', () => ({
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
            toString: vi.fn((transform: { x: number; y: number } | null) => {
                if (!transform) return '';
                return `translate3d(${transform.x}px, ${transform.y}px, 0)`;
            }),
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

describe('DraggableJobCard', () => {
    describe('rendering', () => {
        it('renders job title and company', () => {
            render(<DraggableJobCard job={mockJob} />);

            expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
            expect(screen.getByText('TechCorp')).toBeInTheDocument();
        });

        it('renders with drag handle attributes', () => {
            render(<DraggableJobCard job={mockJob} />);

            const card = screen.getByRole('button');
            expect(card).toHaveAttribute('aria-describedby', 'dnd-description');
        });

        it('renders salary information', () => {
            render(<DraggableJobCard job={mockJob} />);

            expect(screen.getByText('$120k - $150k')).toBeInTheDocument();
        });
    });

    describe('drag visual states', () => {
        it('applies default styling when not dragging', () => {
            render(<DraggableJobCard job={mockJob} />);

            const card = screen.getByRole('button');
            expect(card).not.toHaveClass('opacity-50');
        });

        it('applies dragging class when isDragging is true', async () => {
            // This test will use the mocked useSortable return value
            // We need to test the component with isDragging: true
            const { useSortable } = await import('@dnd-kit/sortable');
            (useSortable as any).mockReturnValueOnce({
                attributes: { 'aria-describedby': 'dnd-description', role: 'button' },
                listeners: { onPointerDown: vi.fn(), onKeyDown: vi.fn() },
                setNodeRef: vi.fn(),
                transform: null,
                transition: null,
                isDragging: true,
            });

            render(<DraggableJobCard job={mockJob} />);

            const card = screen.getByRole('button');
            // When dragging, the original card should be semi-transparent
            expect(card).toHaveClass('opacity-50');
        });
    });

    describe('accessibility', () => {
        it('has focusable drag handle', () => {
            render(<DraggableJobCard job={mockJob} />);

            const card = screen.getByRole('button');
            expect(card).toBeInTheDocument();
        });

        it('includes data-id for dnd-kit identification', () => {
            render(<DraggableJobCard job={mockJob} />);

            const wrapper = screen.getByTestId('draggable-job-card');
            expect(wrapper).toHaveAttribute('data-id', 'job-1');
        });
    });
});
