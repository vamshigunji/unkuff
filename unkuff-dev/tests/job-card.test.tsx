import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { JobCard } from '@/features/dashboard/components/job-card';
import { SerializedJob } from '@/features/dashboard/types';

// Factory for creating consistent test fixtures
function createMockJob(overrides: Partial<SerializedJob> = {}): SerializedJob {
    return {
        id: 'test-job-1',
        userId: 'user-1',
        title: 'Senior React Developer',
        company: 'TechCorp Inc',
        location: 'San Francisco, CA',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        postalCode: null,
        latitude: null,
        longitude: null,
        workMode: 'remote',
        experienceLevel: 'mid-senior',
        employmentType: 'Full-time',
        salarySnippet: '$150k - $200k',
        minSalary: 150000,
        maxSalary: 200000,
        salaryCurrency: 'USD',
        salaryUnit: 'Year',
        description: 'A great job opportunity',
        descriptionHtml: null,
        snippet: 'Join our team',
        skills: ['React', 'TypeScript', 'Node.js'],
        benefits: ['Health Insurance', '401k'],
        qualifications: ['5+ years experience'],
        responsibilities: ['Build features'],
        sourceUrl: 'https://example.com/job/123',
        applyUrl: 'https://example.com/apply/123',
        sourceName: 'indeed',
        sourceId: 'indeed-123',
        sourceActorId: null,
        applicationsCount: null,
        recruiterName: null,
        recruiterUrl: null,
        companyWebsite: 'https://techcorp.com',
        companyIndustry: 'Technology',
        companyLogo: null,
        companyRevenue: null,
        companyEmployeesCount: '1000-5000',
        companyRating: null,
        companyRatingsCount: null,
        companyCeoName: null,
        companyDescription: null,
        technographics: null,
        embedding: null,
        hash: 'abc123',
        status: 'recommended',
        postedAt: null,
        metadata: null,
        rawContent: null,
        createdAt: '2026-01-24T00:00:00Z',
        updatedAt: '2026-01-24T00:00:00Z',
        ...overrides,
    };
}

describe('JobCard', () => {
    beforeEach(() => {
        vi.mock('@/features/matching/scoring-service', () => ({
            SCORE_HIGH_THRESHOLD: 90,
            SCORE_GOOD_THRESHOLD: 70
        }));
    });

    describe('Core Content Display', () => {
        it('renders job title correctly', () => {
            const job = createMockJob({ title: 'Frontend Engineer' });
            render(<JobCard job={job} />);

            expect(screen.getByRole('heading', { name: 'Frontend Engineer' })).toBeInTheDocument();
        });

        it('renders company name correctly', () => {
            const job = createMockJob({ company: 'Awesome Company' });
            render(<JobCard job={job} />);

            expect(screen.getByText('Awesome Company')).toBeInTheDocument();
        });

        it('renders as an article for accessibility', () => {
            const job = createMockJob();
            render(<JobCard job={job} />);

            expect(screen.getByRole('article')).toBeInTheDocument();
        });
    });

    describe('Salary Display', () => {
        it('displays salary snippet when available', () => {
            const job = createMockJob({ salarySnippet: '$120k - $150k' });
            render(<JobCard job={job} />);

            expect(screen.getByText('$120k - $150k')).toBeInTheDocument();
        });

        it('formats min/max salary when snippet not available', () => {
            const job = createMockJob({
                salarySnippet: null,
                minSalary: 100000,
                maxSalary: 130000,
                salaryCurrency: 'USD'
            });
            render(<JobCard job={job} />);

            expect(screen.getByText('$100k – $130k')).toBeInTheDocument();
        });

        it('does not show salary row when no salary data', () => {
            const job = createMockJob({
                salarySnippet: null,
                minSalary: null,
                maxSalary: null
            });
            render(<JobCard job={job} />);

            // New design simply doesn't render the salary row
            expect(screen.queryByText(/\$\d+k/)).not.toBeInTheDocument();
        });

        it('formats min only salary as $XXk+', () => {
            const job = createMockJob({
                salarySnippet: null,
                minSalary: 80000,
                maxSalary: null
            });
            render(<JobCard job={job} />);

            expect(screen.getByText('$80k+')).toBeInTheDocument();
        });
    });

    describe('Posted Date Display', () => {
        beforeEach(() => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date('2026-01-25T12:00:00Z'));
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('displays "Today" for jobs posted today', () => {
            const job = createMockJob({
                postedAt: '2026-01-25T08:00:00Z'
            });
            render(<JobCard job={job} />);

            expect(screen.getByText('Today')).toBeInTheDocument();
        });

        it('displays "Yesterday" for jobs posted yesterday', () => {
            const job = createMockJob({
                postedAt: '2026-01-24T08:00:00Z'
            });
            render(<JobCard job={job} />);

            expect(screen.getByText('Yesterday')).toBeInTheDocument();
        });

        it('displays "Xd ago" for jobs posted within a week', () => {
            const job = createMockJob({
                postedAt: '2026-01-22T08:00:00Z'
            });
            render(<JobCard job={job} />);

            expect(screen.getByText('3d ago')).toBeInTheDocument();
        });

        it('does not show posted date when not available', () => {
            const job = createMockJob({ postedAt: null });
            render(<JobCard job={job} />);

            expect(screen.queryByText(/ago|Today|Yesterday/)).not.toBeInTheDocument();
        });
    });

    describe('Job Fit Score Display', () => {
        it('displays job fit score when present in metadata', () => {
            const job = createMockJob({
                metadata: { score: 85 } as Record<string, unknown>
            });
            render(<JobCard job={job} />);

            expect(screen.getByText('85%')).toBeInTheDocument();
        });

        it('does not display score section when score is not present', () => {
            const job = createMockJob({ metadata: null });
            render(<JobCard job={job} />);

            expect(screen.queryByText('Match')).not.toBeInTheDocument();
        });

        it('applies emerald styling when score > 90', () => {
            const job = createMockJob({
                metadata: { score: 95 } as Record<string, unknown>
            });
            render(<JobCard job={job} />);

            const scoreElement = screen.getByText('95%').closest('div');
            expect(scoreElement).toHaveClass('bg-emerald-500/15');
        });

        it('applies blue styling when score is between 70 and 89', () => {
            const job = createMockJob({
                metadata: { score: 85 } as Record<string, unknown>
            });
            render(<JobCard job={job} />);

            const scoreElement = screen.getByText('85%').closest('div');
            expect(scoreElement).toHaveClass('bg-blue-500/15');
        });

        it('applies neutral styling when score < 70', () => {
            const job = createMockJob({
                metadata: { score: 65 } as Record<string, unknown>
            });
            render(<JobCard job={job} />);

            const scoreElement = screen.getByText('65%').closest('div');
            expect(scoreElement).toHaveClass('bg-white/[0.04]');
        });

        it('displays Match label', () => {
            const job = createMockJob({
                metadata: { score: 85 } as Record<string, unknown>
            });
            render(<JobCard job={job} />);

            expect(screen.getByText('Match')).toBeInTheDocument();
        });
    });

    describe('ATS Score Display', () => {
        it('displays ATS score when present in metadata', () => {
            const job = createMockJob({
                metadata: { atsScore: 92 } as Record<string, unknown>
            });
            render(<JobCard job={job} />);

            expect(screen.getByText('92%')).toBeInTheDocument();
            expect(screen.getByText('Resume')).toBeInTheDocument();
        });

        it('applies amber styling when ATS score >= 95', () => {
            const job = createMockJob({
                metadata: { atsScore: 97 } as Record<string, unknown>
            });
            render(<JobCard job={job} />);

            const atsElement = screen.getByText('97%').closest('div');
            expect(atsElement).toHaveClass('bg-amber-500/15');
        });

        it('applies neutral styling when ATS score < 95', () => {
            const job = createMockJob({
                metadata: { atsScore: 80 } as Record<string, unknown>
            });
            render(<JobCard job={job} />);

            const atsElement = screen.getByText('80%').closest('div');
            expect(atsElement).toHaveClass('bg-white/[0.04]');
        });
    });

    describe('Visual Design', () => {
        it('has premium gradient background', () => {
            const job = createMockJob();
            render(<JobCard job={job} />);

            const card = screen.getByRole('article');
            expect(card.className).toMatch(/bg-gradient-to-br/);
        });

        it('has hover accent line element', () => {
            const job = createMockJob();
            render(<JobCard job={job} />);

            const card = screen.getByRole('article');
            const accentLine = card.querySelector('.absolute.bottom-0');
            expect(accentLine).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('is keyboard focusable', () => {
            const job = createMockJob();
            render(<JobCard job={job} />);

            const card = screen.getByRole('article');
            expect(card).toHaveAttribute('tabIndex', '0');
        });

        it('has visible focus state', () => {
            const job = createMockJob();
            render(<JobCard job={job} />);

            const card = screen.getByRole('article');
            expect(card.className).toMatch(/focus-visible:ring/);
        });

        it('has clear labels for score badges', () => {
            const job = createMockJob({
                metadata: { score: 85, atsScore: 90 } as Record<string, unknown>
            });
            render(<JobCard job={job} />);

            expect(screen.getByText('Match')).toBeInTheDocument();
            expect(screen.getByText('Resume')).toBeInTheDocument();
        });
    });
});

describe('JobCardSkeleton', () => {
    it('renders loading skeleton with proper structure', async () => {
        const { JobCardSkeleton } = await import('@/features/dashboard/components/job-card');
        render(<JobCardSkeleton />);

        const skeleton = document.querySelector('.rounded-xl');
        expect(skeleton).toBeInTheDocument();
    });

    it('has animated pulse elements', async () => {
        const { JobCardSkeleton } = await import('@/features/dashboard/components/job-card');
        render(<JobCardSkeleton />);

        const pulseElements = document.querySelectorAll('.animate-pulse');
        expect(pulseElements.length).toBeGreaterThan(0);
    });
});
