import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import crypto from "crypto";
import { db } from "@/lib/db";
import { jobMatches, atsReports } from "./schema";
import { eq, and } from "drizzle-orm";

const atsReportSchema = z.object({
    score: z.number().min(0).max(100).describe("Overall ATS compatibility score"),
    keywordMatchRate: z.number().min(0).max(100).describe("Percentage of core keywords found"),
    formattingScore: z.number().min(0).max(100).describe("Score based on ATS readability (structure, fonts, layout)"),
    foundKeywords: z.array(z.string()).describe("Keywords successfully matched"),
    missingKeywords: z.array(z.string()).describe("High-impact keywords that are missing"),
    recommendations: z.array(z.string()).describe("Actionable steps to improve the score"),
});

function generate8CharHex(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex').substring(0, 8).toUpperCase();
}

export async function generateATSReport(
    resumeContent: string, 
    jobDescription: string,
    metadata?: { userId: string, jobId: string, resumeVersionId?: string }
): Promise<z.infer<typeof atsReportSchema> & { atsCode: string }> {
    const prompt = `
        You are a sophisticated ATS (Applicant Tracking System) Parser. 
        Evaluate the provided Resume against the Job Description.

        RESUME CONTENT:
        ${resumeContent}

        JOB DESCRIPTION:
        ${jobDescription}

        TASK:
        1. Calculate an overall match score.
        2. Identify matches and gaps in keywords.
        3. Assess the "readability" for a typical ATS system (simulated).
        4. Provide specific recommendations to reach 95%+ score.

        Output JSON only.
    `;

    try {
        const { object } = await generateObject({
            model: google('gemini-1.5-pro'),
            schema: atsReportSchema,
            prompt,
        });

        // Consistent 8-char hex code based on content
        const atsCode = generate8CharHex(resumeContent + jobDescription);
        const fullReport = { ...object, atsCode };

        // Handle evaluation history storage
        if (metadata?.userId && metadata?.jobId) {
            // First UPSERT the job match score
            const match = await db.insert(jobMatches)
                .values({
                    userId: metadata.userId,
                    jobId: metadata.jobId,
                    score: Math.round(object.score),
                })
                .onConflictDoUpdate({
                    target: [jobMatches.userId, jobMatches.jobId],
                    set: {
                        score: Math.round(object.score),
                        calculatedAt: new Date(),
                    }
                })
                .returning();

            if (match[0]) {
                await db.insert(atsReports)
                    .values({
                        jobMatchId: match[0].id,
                        resumeVersionId: metadata.resumeVersionId,
                        reportData: fullReport,
                    });
            }
        }

        return fullReport;
    } catch (error) {
        console.error("ATS Evaluation Error:", error);
        throw error;
    }
}
