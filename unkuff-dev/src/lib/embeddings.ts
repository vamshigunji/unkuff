
import { embed } from 'ai';
import { googleProvider } from './gemini';

/**
 * Generates a vector embedding for the given text using Google's Gemini model.
 * Result is a 1536-dimensional vector.
 * 
 * @param text The text to embed
 * @returns Array of numbers representing the embedding
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    if (!text) {
        throw new Error('Text is required for embedding generation');
    }

    try {
        const { embedding } = await embed({
            model: googleProvider.textEmbeddingModel('gemini-embedding-001'),
            value: text,
        });

        return embedding;
    } catch (error) {
        console.error('Error generating embedding:', error);
        throw error;
    }
}
