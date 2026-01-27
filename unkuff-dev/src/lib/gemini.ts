
import { createGoogleGenerativeAI } from '@ai-sdk/google';

if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.warn('Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable');
}

export const googleProvider = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});
