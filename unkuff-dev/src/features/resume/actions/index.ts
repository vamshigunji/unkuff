"use server";

import { db } from "@/lib/db";
import { profiles, workExperience, education, skills, certifications } from "../../profile/schema";
import { generatedResumes } from "../../tailoring/schema";
import { jobs } from "../../jobs/schema";
import { decrypt } from "@/lib/encryption";
import { auth } from "@/auth";
import { eq, and, or } from "drizzle-orm";
import type { ResumeData, ResumeExperience, ResumeEducation, ResumeCertification } from "../types";

import { generateHighFidelityScore } from "../../matching/services/ats-service";
import { jobMatches } from "../../matching/schema";

// ============================================================================
// TYPES
// ============================================================================

export type ActionResponse<T> = {
    data: T | null;
    error: string | null;
};

// ============================================================================
// RESUME DATA ACTIONS
// ============================================================================

/**
 * Fetches all profile data and transforms it into a resume-ready format.
 * This is used by the resume preview to render the user's resume.
 */
export async function getResumeData(id?: string): Promise<ActionResponse<ResumeData>> {
    const session = await auth();
    if (!session?.user?.id) {
        return { data: null, error: "Unauthorized" };
    }

    const userId = session.user.id;

    try {
        // If an ID is provided, check if it's a generated resume or a jobId
        if (id) {
            // Try fetching generated resume first
            const generated = await db.query.generatedResumes.findFirst({
                where: and(
                    eq(generatedResumes.userId, userId),
                    or(
                        eq(generatedResumes.id, id),
                        eq(generatedResumes.jobId, id)
                    )
                ),
                orderBy: (table, { desc }) => [desc(table.updatedAt)],
            });

            // Fetch job description and existing match score
            const [job, existingMatch] = await Promise.all([
                db.query.jobs.findFirst({ where: eq(jobs.id, id) }),
                db.query.jobMatches.findFirst({
                    where: and(eq(jobMatches.userId, userId), eq(jobMatches.jobId, id))
                })
            ]);

            if (generated && (generated.content || generated.jobId === id)) {
                const content = (generated.content || {}) as any;
                
                return { 
                    data: {
                        ...content,
                        jobId: id,
                        jobTitle: job?.title,
                        jobCompany: job?.company,
                        jobDescription: job?.description,
                        atsScore: generated.atsScore || existingMatch?.score || 0
                    }, 
                    error: null 
                };
            }

            if (job) {
                // Fetch Master Profile to provide initial content
                const profile = await db.query.profiles.findFirst({
                    where: eq(profiles.userId, userId),
                });

                // Get work experience for basic data
                const workExp = await db.query.workExperience.findMany({
                    where: profile ? eq(workExperience.profileId, profile.id) : undefined,
                    orderBy: (table, { desc }) => [desc(table.startDate)],
                });

                const initialResumeData: ResumeData = {
                    contact: {
                        fullName: profile?.name || "",
                        email: session.user.email || "",
                        phone: null,
                        location: null,
                    },
                    summary: profile?.summary || "",
                    experience: workExp.map(exp => ({
                        id: exp.id,
                        company: exp.company,
                        title: exp.title,
                        location: exp.location,
                        startDate: null,
                        endDate: null,
                        isCurrent: exp.isCurrent === "true",
                        description: exp.description,
                        accomplishments: Array.isArray(exp.accomplishments) ? exp.accomplishments : [],
                    })),
                    education: [],
                    skills: [],
                    certifications: [],
                    jobId: id,
                    jobTitle: job.title,
                    jobCompany: job.company,
                    jobDescription: job.description,
                    atsScore: existingMatch?.score || 0,
                    keywords: existingMatch?.keywords as any || null
                };

                // [TDD IMPROVEMENT] If score is 0, trigger an initial background scoring
                // but don't block the UI return for the first render.
                // We'll return the initial data and let the client know it's "calculating" if score is 0
                return { data: initialResumeData, error: null };
            }
        }

        // Default to Master Profile
        const profile = await db.query.profiles.findFirst({
            where: eq(profiles.userId, userId),
        });

        if (!profile) {
            return { data: null, error: "Profile not found" };
        }

        const profileId = profile.id;

        // Fetch all related data in parallel
        const [workExp, edu, skillsList, certs] = await Promise.all([
            db.query.workExperience.findMany({
                where: eq(workExperience.profileId, profileId),
                orderBy: (table, { desc }) => [desc(table.startDate)],
            }),
            db.query.education.findMany({
                where: eq(education.profileId, profileId),
                orderBy: (table, { desc }) => [desc(table.startDate)],
            }),
            db.query.skills.findMany({
                where: eq(skills.profileId, profileId),
            }),
            db.query.certifications.findMany({
                where: eq(certifications.profileId, profileId),
                orderBy: (table, { desc }) => [desc(table.issueDate)],
            }),
        ]);

        // Transform data into resume format
        const resumeData: ResumeData = {
            contact: {
                fullName: profile.name || "",
                email: session.user.email || "",
                phone: profile.phone ? decrypt(profile.phone) : null,
                location: profile.location || null,
                linkedin: null, // TODO: Fetch from socialLinks table
                github: null,
                portfolio: null,
            },
            summary: profile.summary || profile.bio || null,
            experience: workExp.map((exp): ResumeExperience => ({
                id: exp.id,
                company: exp.company,
                title: exp.title,
                location: exp.location,
                startDate: exp.startDate ? formatDate(exp.startDate) : null,
                endDate: exp.endDate ? formatDate(exp.endDate) : null,
                isCurrent: exp.isCurrent === "true",
                description: exp.description,
                accomplishments: Array.isArray(exp.accomplishments)
                    ? exp.accomplishments.filter((a): a is string => typeof a === 'string')
                    : [],
            })),
            education: edu.map((ed): ResumeEducation => ({
                id: ed.id,
                institution: ed.institution,
                degree: ed.degree,
                fieldOfStudy: ed.fieldOfStudy,
                location: ed.location,
                startDate: ed.startDate ? formatDate(ed.startDate) : null,
                endDate: ed.endDate ? formatDate(ed.endDate) : null,
            })),
            skills: skillsList.map(s => s.name),
            certifications: certs.map((cert): ResumeCertification => ({
                id: cert.id,
                name: cert.name,
                issuer: cert.issuer,
                issueDate: cert.issueDate ? formatDate(cert.issueDate) : null,
                expiryDate: cert.expiryDate ? formatDate(cert.expiryDate) : null,
                credentialId: cert.credentialId,
            })),
        };

        return { data: resumeData, error: null };
    } catch (error) {
        console.error("Failed to get resume data:", error);
        return { data: null, error: "Failed to load resume data" };
    }
}

/**
 * Check if user has sufficient profile data for resume preview.
 * Returns true if they have at least name and some content.
 */
export async function hasProfileData(): Promise<ActionResponse<boolean>> {
    const session = await auth();
    if (!session?.user?.id) {
        return { data: false, error: "Unauthorized" };
    }

    const userId = session.user.id;

    try {
        const profile = await db.query.profiles.findFirst({
            where: eq(profiles.userId, userId),
            columns: { id: true, name: true, summary: true, bio: true },
        });

        if (!profile) {
            return { data: false, error: null };
        }

        // Check if they have at least a name
        const hasName = Boolean(profile.name);
        const hasSummary = Boolean(profile.summary || profile.bio);

        return { data: hasName || hasSummary, error: null };
    } catch (error) {
        console.error("Failed to check profile data:", error);
        return { data: false, error: "Failed to check profile data" };
    }
}

// ============================================================================
// HELPERS
// ============================================================================

function formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
    });
}
