
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateEmbedding } from '@/lib/embeddings';
import { embed } from 'ai';
import { googleProvider } from '@/lib/gemini';

// Mock the ai module
vi.mock('ai', () => ({
    embed: vi.fn(),
}));

// Mock the gemini provider
vi.mock('@/lib/gemini', () => ({
    googleProvider: {
        textEmbeddingModel: vi.fn().mockReturnValue('mock-gemini-embedding-model'),
    },
}));

describe('Embedding Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should generate an embedding for a given text', async () => {
        // Setup mock response
        const mockEmbedding = Array(1536).fill(0.1);
        (embed as any).mockResolvedValue({
            embedding: mockEmbedding,
        });

        const text = 'This is a test bio for embedding generation';
        const result = await generateEmbedding(text);

        // Verify googleProvider.textEmbeddingModel was called
        expect(googleProvider.textEmbeddingModel).toHaveBeenCalledWith('gemini-embedding-001');

        // Verify embed was called with correct parameters
        expect(embed).toHaveBeenCalledWith({
            model: 'mock-gemini-embedding-model',
            value: text,
        });

        // Verify result matches mock
        expect(result).toEqual(mockEmbedding);
        expect(result).toHaveLength(1536);
    });

    it('should throw an error if embedding generation fails', async () => {
        // Setup mock failure
        (embed as any).mockRejectedValue(new Error('API Error'));

        await expect(generateEmbedding('fail test')).rejects.toThrow('API Error');
    });

    it('should handle empty input gracefully or throw validation error', async () => {
        await expect(generateEmbedding('')).rejects.toThrow();
    });
});
