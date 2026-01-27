
import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RedZoneList } from '@/features/matching/components/red-zone-list';

describe('RedZoneList Component', () => {
    test('renders nothing when no gaps', () => {
        const { container } = render(<RedZoneList gapAnalysis={{ gaps: [] }} />);
        expect(container).toBeEmptyDOMElement();
    });

    test('renders gaps when provided', () => {
        const mockGaps = {
            gaps: [
                { missing: 'React', reason: 'Missing React', closest_match: 'Angular' }
            ]
        };
        render(<RedZoneList gapAnalysis={mockGaps} />);

        expect(screen.getByText('Red Zone Matches')).toBeInTheDocument();
        expect(screen.getByText('React')).toBeInTheDocument();
        expect(screen.getByText('Missing Keyword')).toBeInTheDocument(); // Label
    });

    test('renders loading state', () => {
        const { container } = render(<RedZoneList gapAnalysis={null} isLoading={true} />);
        expect(container.firstChild).toHaveClass('animate-pulse');
    });
});
