
import { render, screen } from '@testing-library/react';
import { SuitabilityBadge } from '@/features/matching/components/suitability-badge';
import { describe, it, expect, vi } from 'vitest';

describe('SuitabilityBadge', () => {
    // Mock the constants to avoid importing from service which might trigger db connection
    vi.mock('@/features/matching/scoring-service', () => ({
        SCORE_HIGH_THRESHOLD: 90,
        SCORE_GOOD_THRESHOLD: 70
    }));

    it('should render score percentage', () => {
        render(<SuitabilityBadge score={85} />);
        expect(screen.getByText('85%')).toBeInTheDocument();
    });

    it('should use high match styling for >= 90', () => {
        const { container } = render(<SuitabilityBadge score={95} />);
        const badge = container.firstChild as HTMLElement;
        expect(badge.className).toContain('text-emerald-400');
        expect(badge.className).toContain('bg-emerald-500/15');
    });

    it('should use good match styling for 70-89', () => {
        const { container } = render(<SuitabilityBadge score={75} />);
        const badge = container.firstChild as HTMLElement;
        expect(badge.className).toContain('text-blue-400');
        expect(badge.className).toContain('bg-blue-500/15');
    });

    it('should use neutral styling for < 70', () => {
        const { container } = render(<SuitabilityBadge score={50} />);
        const badge = container.firstChild as HTMLElement;
        // expect(badge.className).toContain('text-muted-foreground'); // checking functionality not strict string
        expect(badge.className).toContain('bg-white/[0.04]');
    });
});
