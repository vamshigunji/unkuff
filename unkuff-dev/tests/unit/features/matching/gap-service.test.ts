
import { expect, test, describe, vi, beforeEach } from 'vitest';
import { generateGapAnalysis } from '@/features/matching/gap-service';
import { generateObject } from 'ai';

// Mock the AI SDK
vi.mock('ai', () => ({
    generateObject: vi.fn(),
}));
// Mock google provider if imported to avoid errors, or just mock the input to generateObject if we inject model
vi.mock('@ai-sdk/google', () => ({
    google: vi.fn().mockImplementation(() => 'mock-google-model'),
}));

describe('Gap Analysis Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('generateGapAnalysis calls AI and returns structured gaps', async () => {
        const mockJob = {
            id: 'job-1',
            title: 'Frontend Developer',
            description: 'Requires React Native and Node.js.',
            company: 'TechCorp',
        } as any;

        const mockProfile = {
            id: 'user-1',
            firstName: 'John',
            lastName: 'Doe',
            bio: 'Expert in React.',
            skills: ['React'],
            workExperience: [{ description: 'Built React apps.' }],
            projects: [],
        } as any;

        const mockGapResponse = {
            gaps: [
                {
                    missing: 'React Native',
                    closest_match: 'Built React apps',
                    reason: 'Experience is in React web, not Native.',
                },
            ],
        };

        (generateObject as any).mockResolvedValue({
            object: mockGapResponse,
        });

        const result = await generateGapAnalysis(mockJob, mockProfile);

        expect(generateObject).toHaveBeenCalled();
        expect(result).toEqual(mockGapResponse);

        // verify prompts contain key info
        const callArgs = (generateObject as any).mock.calls[0][0];
        expect(callArgs.prompt).toContain('Frontend Developer');
        expect(callArgs.prompt).toContain('React Native');
        expect(callArgs.prompt).toContain('Expert in React');
    });
});
