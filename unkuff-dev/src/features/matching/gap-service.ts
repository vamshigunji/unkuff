
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { GapSchema } from "./schema";

const gapAnalysisSchema = z.object({
    gaps: z.array(z.object({
        missing: z.string().describe("The specific skill or keyword missing from the profile"),
        closest_match: z.string().optional().describe("The most relevant existing experience/project, even if not a direct match"),
        reason: z.string().describe("Why this is a gap and how the closest match is insufficient"),
    })),
});

export async function generateGapAnalysis(job: any, profile: any): Promise<GapSchema> {
    const prompt = `
        You are an expert Career Coach and Technical Recruiter.
        Analyze the following Job Description and Candidate Profile to identify "Red Zone" gaps.
        A "Red Zone" gap is a critical hard skill, requirement, or qualification explicitly mentioned in the Job that is NOT adequately represented in the Candidate Profile.

        JOB DETAILS:
        Title: ${job.title}
        Company: ${job.company}
        Description: ${job.description || ''}
        Snippet: ${job.snippet || ''}
        Required Skills: ${Array.isArray(job.skills) ? job.skills.join(', ') : ''}

        CANDIDATE PROFILE:
        Bio: ${profile.bio || ''}
        Skills: ${Array.isArray(profile.skills) ? profile.skills.map((s: any) => typeof s === 'string' ? s : s.name).join(', ') : ''}
        Work Experience: ${Array.isArray(profile.workExperience) ? profile.workExperience.map((w: any) => `${w.title} at ${w.company}: ${w.description || ''}`).join('; ') : ''}
        Projects: ${Array.isArray(profile.projects) ? profile.projects.map((p: any) => `${p.name}: ${p.description || ''}`).join('; ') : ''}

        TASK:
        1. Identify missing keywords or skills (facts present in Job but absent/weak in Profile).
        2. For each missing item, find the *closest* truth anchor in the profile (if any) that could bridge the gap.
        3. Explain strictly why it is a gap.

        Output JSON only.
    `;

    // Using gemini-1.5-flash as standard
    const result = await generateObject({
        model: google('gemini-1.5-flash'),
        schema: gapAnalysisSchema,
        prompt,
    });

    return result.object;
}
