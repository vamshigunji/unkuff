import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { tailoredResumeContentSchema } from './schema';
import { z } from 'zod';
import { checkForHallucinations } from './guardrails';

// We define the input types to be independent of specific DB schema for easier testing
export type MasterProfileData = {
    bio: string | null;
    workExperience: { company: string | null; title: string | null; }[];
    skills: { name: string | null; }[]; // Adjusted to match DB schema shape
    education: { institution: string | null; degree: string | null; }[];
};

export type JobDescriptionData = {
    title: string;
    description: string;
    company: string;
};

export async function generateResumeContent(
    profile: MasterProfileData,
    job: JobDescriptionData
) {
    // 1. Construct the System Prompt (Guardrails)
    const systemPrompt = `
    You are an expert Resume Tailoring AI Agent.
    
    GOAL: Tailor the candidate's Master Profile to match the Job Description with >95% ATS suitability.
    
    CRITICAL RULES (HALLUCINATION GUARDRAILS):
    1. TRUTH ANCHOR: You must ONLY use facts present in the Master Profile. 
    2. DO NOT INVENT: Do not add skills, companies, or degrees that are not explicitly in the profile.
    3. REPHRASE: You MAY rephrase bullet points to emphasize impact and match keywords, but the underlying fact must remain true.
    4. OMIT: You MAY omit irrelevant experience to save space.
    
    OUTPUT FORMAT: Return a structured JSON object.
    `;

    // 2. Construct the User Prompt (Context)
    const userPrompt = `
    MASTER PROFILE:
    ${JSON.stringify(profile, null, 2)}
    
    TARGET JOB:
    ${JSON.stringify(job, null, 2)}
    
    TASK: Generate a tailored resume JSON.
    `;

    try {
        const { object } = await generateObject({
            model: google('gemini-1.5-pro-latest'),
            schema: tailoredResumeContentSchema,
            system: systemPrompt,
            prompt: userPrompt,
            temperature: 0.2, // Low temp for factual consistency
        });

        // 3. Post-Generation Verification (Hallucination Check)
        const verification = checkForHallucinations(object, profile);
        if (verification.hasHallucination) {
            console.warn(`[Guardrails] Hallucinations detected: ${verification.hallucinations.join(", ")}`);
            // Throwing error to trigger retry or failure.
            // In a more advanced version, we could feed this back into a repair prompt.
            throw new Error(`Hallucination detected: ${verification.hallucinations.join(", ")}`);
        }

        return object;

    } catch (error) {
        console.error("AI Generation Error:", error);
        throw error; // Re-throw to handle upstream
    }
}

// Internal Scoring Function (using simple keyword overlap for MVP, or small AI call)
export async function evaluateSuitability(
    resume: z.infer<typeof tailoredResumeContentSchema>,
    job: JobDescriptionData
): Promise<number> {
    // For FR10/13: We need a numerical score. 
    // Option A: pgvector cosine similarity (requires embedding)
    // Option B: LLM-based scoring (easier for "Logic" check)

    const evaluationPrompt = `
    RESUME: ${JSON.stringify(resume)}
    JOB: ${JSON.stringify(job)}
    
    Evaluate the ATS match score (0-100) based on keyword coverage and relevance.
    Return ONLY a JSON object: { "score": number, "missingKeywords": string[] }
    `;

    try {
        const { object } = await generateObject({
            model: google('gemini-1.5-pro-latest'),
            schema: z.object({
                score: z.number(),
                missingKeywords: z.array(z.string())
            }),
            prompt: evaluationPrompt,
        });
        return object.score;
    } catch (e) {
        console.error("Scoring error", e);
        return 0;
    }
}

export async function generateOptimizedResume(
    profile: MasterProfileData,
    job: JobDescriptionData,
    maxRetries = 3,
    onStatus?: (status: "thinking" | "mapping" | "refining" | "grounding" | "complete") => void
) {
    onStatus?.("thinking");
    let currentResume = await generateResumeContent(profile, job);
    onStatus?.("mapping");

    let currentScore = await evaluateSuitability(currentResume, job);
    onStatus?.("grounding");

    let attempts = 0;

    // console.log(`[Tailoring] Initial Score: ${currentScore}`);

    while (currentScore < 95 && attempts < maxRetries) {
        attempts++;
        // console.log(`[Tailoring] Attempt ${attempts} - Refining...`);
        onStatus?.("refining");


        const refusalPrompt = `
        The previous resume scored ${currentScore}/100.
        Goal: 95/100.
        
        Previous Output: ${JSON.stringify(currentResume)}
        
        Refine the resume to better match the job description, SPECIFICALLY maximizing keyword density for these missing areas (if any).
        STRICT RULES:
        1. Do NOT invent facts.
        2. Rephrase existing experience to align with ATS keywords.
        `;

        const { object: refinedResume } = await generateObject({
            model: google('gemini-1.5-pro-latest'),
            schema: tailoredResumeContentSchema,
            prompt: refusalPrompt,
            system: "You are an expert Resume Optimizer. Improve the resume without hallucinating.",
            temperature: 0.7 // Slightly higher for creatvity in phrasing
        });

        // Verify refinement for hallucinations too
        const verification = checkForHallucinations(refinedResume, profile);
        if (verification.hasHallucination) {
            console.warn(`[Guardrails] Refinement hallucinated: ${verification.hallucinations.join(", ")}. Discarding attempt.`);
            // Skip this attempt if it lied
            continue;
        }

        const newScore = await evaluateSuitability(refinedResume, job);
        onStatus?.("grounding");


        if (newScore > currentScore) {
            currentResume = refinedResume;
            currentScore = newScore;
        } else {
            // console.log(`[Tailoring] New score ${newScore} not better than ${currentScore}. Keeping previous.`);
        }
    }

    onStatus?.("complete");
    return { resume: currentResume, score: currentScore, passes: attempts };
}
