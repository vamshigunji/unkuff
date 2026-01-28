import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

const keywordSchema = z.object({
    hardSkills: z.array(z.string()).describe("Technical skills, specific tools, programming languages, and platforms mentioned in the JD"),
    softSkills: z.array(z.string()).describe("Interpersonal qualities, leadership traits, and professional soft skills"),
    domainKeywords: z.array(z.string()).describe("Industry-specific terminology, regulatory standards, or specialized domain knowledge"),
    atsKeywords: z.array(z.string()).describe("The most critical 5-10 keywords that are likely used as primary filters in an ATS"),
    certifications: z.array(z.string()).describe("Specific certifications or licenses required or preferred"),
    methodologies: z.array(z.string()).describe("Project management or development methodologies (e.g., Agile, Scrum, Six Sigma)"),
});

export async function extractKeywords(jobDescription: string): Promise<z.infer<typeof keywordSchema>> {
    // Truncate JD to ~25,000 characters to prevent token limit issues (roughly 6k-8k tokens)
    const truncatedJD = jobDescription.length > 25000 
        ? jobDescription.substring(0, 25000) + "..." 
        : jobDescription;

    const prompt = `
        You are a World-Class ATS (Applicant Tracking System) Architect and Senior Technical Recruiter.
        Analyze the following Job Description with extreme precision to extract high-fidelity keywords.

        JOB DESCRIPTION:
        ${truncatedJD}

        TASK:
        Extract and categorize keywords that are essential for passing through automated screening filters with a perfect match score.

        CATEGORIES:
        1. Hard Skills: Technical stack, software, hardware, and specific tools.
        2. Soft Skills: Communication, leadership, adaptability, etc.
        3. Domain Keywords: Industry-specific jargon, market concepts, and specialized knowledge areas.
        4. ATS Keywords: The 'Must-Have' phrases that likely carry the most weight in ranking algorithms.
        5. Certifications: Any required or bonus credentials.
        6. Methodologies: Frameworks like Agile, DevOps, Waterfall, etc.

        Ensure the keywords are extracted exactly as they appear or in their most common industry-standard form.
    `;

    try {
        const { object } = await generateObject({
            model: google('gemini-2.0-flash-001'),
            schema: keywordSchema,
            prompt,
        });

        return object;
    } catch (error) {
        console.error("Keyword Extraction Error:", error);
        return { 
            hardSkills: [], 
            softSkills: [], 
            domainKeywords: [], 
            atsKeywords: [],
            certifications: [],
            methodologies: []
        };
    }
}
