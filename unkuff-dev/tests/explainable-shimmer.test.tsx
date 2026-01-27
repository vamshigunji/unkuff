
import { render, screen } from '@testing-library/react';
import { ExplainableShimmer } from '@/features/tailoring/components/explainable-shimmer';
import { describe, it, expect } from 'vitest';

describe('ExplainableShimmer', () => {
    it('renders "Thinking..." when status is thinking', () => {
        render(<ExplainableShimmer status="thinking" />);
        expect(screen.getByText(/Thinking\.\.\./i)).toBeDefined();
    });

    it('renders "Mapping skills..." when status is mapping', () => {
        render(<ExplainableShimmer status="mapping" />);
        expect(screen.getByText(/Mapping skills\.\.\./i)).toBeDefined();
    });

    it('renders "Refining content..." when status is refining', () => {
        render(<ExplainableShimmer status="refining" />);
        expect(screen.getByText(/Refining content\.\.\./i)).toBeDefined();
    });

    it('renders "Grounding facts..." when status is grounding', () => {
        render(<ExplainableShimmer status="grounding" />);
        expect(screen.getByText(/Grounding facts\.\.\./i)).toBeDefined();
    });

    it('renders "Complete!" when status is complete', () => {
        render(<ExplainableShimmer status="complete" />);
        expect(screen.getByText(/Complete!/i)).toBeDefined();
    });

    it('renders "Error" when status is error', () => {
        render(<ExplainableShimmer status="error" />);
        expect(screen.getByText(/Error/i)).toBeDefined();
    });

    it('renders nothing when status is idle', () => {
        const { container } = render(<ExplainableShimmer status="idle" />);
        expect(container.firstChild).toBeNull();
    });

    it('uses custom message when provided', () => {
        render(<ExplainableShimmer status="thinking" message="Custom thinking message" />);
        expect(screen.getByText(/Custom thinking message/i)).toBeDefined();
    });
});
