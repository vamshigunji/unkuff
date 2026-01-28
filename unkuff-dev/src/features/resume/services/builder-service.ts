import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

const builtResumeSchema = z.object({
    summary: z.string().describe("Impactful professional summary aligned with the target role"),
    experience: z.array(z.object({
        company: z.string(),
        title: z.string(),
        location: z.string().optional(),
        startDate: z.string().describe("e.g., Jan 2020"),
        endDate: z.string().describe("e.g., Present or Dec 2023"),
        accomplishments: z.array(z.string()).describe("High-impact, results-oriented bullet points using the STAR method"),
    })),
    skills: z.array(z.string()).describe("List of technical and professional skills"),
    education: z.array(z.object({
        institution: z.string(),
        degree: z.string(),
        fieldOfStudy: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string(),
    })),
});

export type ResumeBuilderOptions = {
    overexaggerate?: boolean;
    targetScore?: number;
};

export async function buildResumeFromScratch(
    profile: any,
    job: any,
    options: ResumeBuilderOptions = {}
): Promise<z.infer<typeof builtResumeSchema>> {
    const { overexaggerate = false, targetScore = 95 } = options;

    // Truncate Master Profile if it's too large (~30k chars limit)
    let profileStr = JSON.stringify(profile, null, 2);
    if (profileStr.length > 30000) {
        profileStr = profileStr.substring(0, 30000) + "... [Truncated due to length]";
    }

    // Truncate Job if it's too large
    let jobStr = JSON.stringify(job, null, 2);
    if (jobStr.length > 15000) {
        jobStr = jobStr.substring(0, 15000) + "... [Truncated]";
    }

    const systemPrompt = `
        You are an elite Resume Architect and Career Strategist specializing in high-performance career assets.
        Your goal is to build a high-scoring resume using the provided Master Profile and Job Description.

        TRUTH ANCHOR:
        The Master Profile is the absolute source of truth. Do not invent entirely new jobs or degrees.

        ${overexaggerate ? `
        MODE: "FAKE IT MODE" (GROUNDED METRIC STRETCHING)
        You are authorized to "stretch" existing accomplishments to bridge gaps. 
        - If an accomplishment is vague (e.g., "improved speed"), quantify it with plausible metrics (e.g., "optimized load times by 40%").
        - If a skill is listed but no specific project is mentioned, craft a power statement that integrates that skill into an existing work experience.
        - Frame responsibilities as high-stakes achievements.
        - Ensure all "stretched" claims remain grounded in the candidate's actual skill set. If they know React, you can say they led a React migration, but don't say they know Rust if it's not in the profile.
        ` : `
        MODE: TRUTH ANCHOR
        Stay strictly within the bounds of provided facts. Focus on rephrasing for impact and alignment without inflating metrics or responsibilities beyond what is documented.
        `}

        STRATEGY:
        1. STAR METHOD: Every bullet point should follow the Situation, Task, Action, Result framework.
        2. KEYWORD INJECTION: Naturally weave in high-priority keywords from the Job Description.
        3. FORMATTING: Use professional, ATS-friendly language and structure.

        GOAL: Achieve a simulated ATS score of ${targetScore}+.
    `;

    const userPrompt = `
        MASTER PROFILE:
        ${profileStr}

        JOB DESCRIPTION:
        ${jobStr}

        TASK: Build a high-scoring resume from scratch that positions the candidate as the ideal hire.
    `;

    try {
        const { object } = await generateObject({
            model: google('gemini-2.0-flash-001'),
            schema: builtResumeSchema,
            system: systemPrompt,
            prompt: userPrompt,
            temperature: overexaggerate ? 0.7 : 0.3,
        });

        return object;
    } catch (error) {
        console.error("Resume Build Error:", error);
        throw error;
    }
}
