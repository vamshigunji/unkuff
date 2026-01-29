import { google } from "@ai-sdk/google";
import { generateObject, embed } from "ai";
import { z } from "zod";
import crypto from "crypto";
import { db } from "@/lib/db";
import { jobMatches, atsReports } from "../schema";
import { eq, and } from "drizzle-orm";

const atsReportSchema = z.object({
    score: z.number().min(0).max(100).describe("Overall ATS compatibility score"),
    keywordMatchRate: z.number().min(0).max(100).describe("Percentage of core keywords found"),
    formattingScore: z.number().min(0).max(100).describe("Score based on ATS readability (structure, fonts, layout)"),
    foundKeywords: z.array(z.string()).describe("Keywords successfully matched"),
    missingKeywords: z.array(z.string()).describe("High-impact keywords that are missing"),
    recommendations: z.array(z.string()).describe("Actionable steps to improve the score"),
    semanticSimilarity: z.number().optional().describe("Conceptual alignment 0-1"),
});

function calculateCosineSimilarity(vecA: number[], vecB: number[]) {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0.5;
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (magA * magB);
}

async function generateEmbedding(text: string): Promise<number[]> {
    const { embedding } = await embed({
        model: google.textEmbeddingModel('text-embedding-004'),
        value: text,
    });
    return embedding;
}

function generate8CharHex(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex').substring(0, 8).toUpperCase();
}

export async function generateHighFidelityScore(
    resumeContent: string, 
    jobDescription: string,
    metadata?: { userId: string, jobId: string, resumeVersionId?: string }
): Promise<z.infer<typeof atsReportSchema> & { atsCode: string }> {
    // 1. Semantic Scorer (30%)
    let semanticSim = 0.5;
    try {
        const [resEmb, jobEmb] = await Promise.all([
            generateEmbedding(resumeContent.substring(0, 5000)),
            generateEmbedding(jobDescription.substring(0, 5000))
        ]);
        semanticSim = calculateCosineSimilarity(resEmb, jobEmb);
    } catch (e) {
        console.warn("Embedding failed, defaulting semantic score.");
    }

    // 2. Keyword & Density Engine (70%)
    const prompt = `
        You are a high-performance ATS Parser and Career Strategist.
        Evaluate the following Resume against the Job Description.

        RESUME CONTENT:
        ${resumeContent.substring(0, 10000)}

        JOB DESCRIPTION:
        ${jobDescription.substring(0, 10000)}

        TASK:
        1. Extract ALL matching keywords (technical skills, soft skills, tools, certifications) found in both.
        2. Identify CRITICAL missing keywords from the JD that would improve the candidate's match.
        3. Evaluate ATS readability (structure, section headers, font clarity).
        4. Calculate a realistic compatibility score.

        Output ONLY a JSON object matching the schema. No conversational text.
    `;

    try {
        const { object } = await generateObject({
            model: google('gemini-2.0-flash-001'),
            schema: atsReportSchema,
            prompt,
        });

        // 3. Composite UHS Weighted Score
        // 4-Factor Plan: Semantic (20%), Keywords (50%), Formatting (10%), Base (20%)
        
        // Ensure keywordMatchRate is actually based on matching keywords
        const totalKeywords = object.foundKeywords.length + object.missingKeywords.length;
        const realKeywordMatchRate = totalKeywords > 0 
            ? (object.foundKeywords.length / totalKeywords) * 100 
            : 0;
        
        const keywordScore = realKeywordMatchRate * 0.5;
        const semanticScore = (semanticSim || 0.5) * 20;
        const formattingScore = (object.formattingScore || 0) * 0.1;
        
        // Final calculation with a bit more floor protection
        let finalScore = Math.round(keywordScore + semanticScore + formattingScore + 20);
        
        // If we found NO keywords but there is semantic similarity, give a small boost
        if (object.foundKeywords.length === 0 && semanticSim > 0.6) {
            finalScore += 5;
        }

        console.log(`[UHS Scorer] Final: ${finalScore} (KW: ${keywordScore.toFixed(1)}, SEM: ${semanticScore.toFixed(1)}, FMT: ${formattingScore.toFixed(1)})`);

        const atsCode = generate8CharHex(resumeContent + jobDescription);
        const fullReport = { 
            ...object, 
            score: Math.min(100, Math.max(0, finalScore)), 
            atsCode, 
            semanticSimilarity: semanticSim 
        };

        // Persist
        if (metadata?.userId && metadata?.jobId) {
            const match = await db.insert(jobMatches)
                .values({
                    userId: metadata.userId,
                    jobId: metadata.jobId,
                    score: fullReport.score,
                    keywords: {
                        matched: fullReport.foundKeywords,
                        missing: fullReport.missingKeywords
                    },
                    calculatedAt: new Date(),
                })
                .onConflictDoUpdate({
                    target: [jobMatches.userId, jobMatches.jobId],
                    set: {
                        score: fullReport.score,
                        keywords: {
                            matched: fullReport.foundKeywords,
                            missing: fullReport.missingKeywords
                        },
                        calculatedAt: new Date(),
                    }
                })
                .returning();

            if (match[0]) {
                await db.insert(atsReports).values({
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

// Alias for existing calls
export const generateATSReport = generateHighFidelityScore;
