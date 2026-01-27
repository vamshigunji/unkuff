import { db } from "@/lib/db";
import { jobs } from "@/features/jobs/schema";
import { ingestionLogs } from "@/features/ingestion/schema";
import { BaseProvider } from "./base-provider";
import { NormalizedJob, IngestionResult } from "./types";
import { calculateJobHash } from "./utils";
import { eq, and } from "drizzle-orm";
import { updateJobEmbedding } from "./embedding-service";

export class IngestionService {
    private providers: BaseProvider[];
    private maxRetries = 2;

    constructor(providers: BaseProvider[]) {
        this.providers = providers;
    }

    private validateNumber(val: any): number | null {
        return (typeof val === "number" && !isNaN(val)) ? val : null;
    }

    /**
     * Runs all registered providers for a given query with retry logic and logging.
     */
    public async run(userId: string, query: string, options?: any): Promise<IngestionResult> {
        const allJobs: NormalizedJob[] = [];
        const allErrors: string[] = [];
        let totalFound = 0;

        for (const provider of this.providers) {
            let attempt = 0;
            let success = false;
            let lastError = "";

            // Create log entry
            const [log] = await db.insert(ingestionLogs)
                .values({
                    provider: provider.name,
                    status: "in_progress",
                    startedAt: new Date(),
                })
                .returning();

            while (attempt <= this.maxRetries && !success) {
                try {
                    const result = await provider.fetch(query, options);
                    allJobs.push(...result.jobs);
                    totalFound += result.totalFound;
                    if (result.errors) allErrors.push(...result.errors);
                    
                    success = true;
                    
                    // Update log as success
                    await db.update(ingestionLogs)
                        .set({
                            status: "success",
                            stats: { jobsFound: result.totalFound, jobsSaved: result.jobs.length },
                            completedAt: new Date(),
                        })
                        .where(eq(ingestionLogs.id, log.id));
                        
                } catch (error) {
                    attempt++;
                    lastError = String(error);
                    console.error(`Provider ${provider.name} failed (attempt ${attempt}):`, error);
                    
                    if (attempt > this.maxRetries) {
                        allErrors.push(`${provider.name} failed after ${attempt} attempts: ${lastError}`);
                        
                        // Update log as failure
                        await db.update(ingestionLogs)
                            .set({
                                status: "failure",
                                error: lastError,
                                completedAt: new Date(),
                            })
                            .where(eq(ingestionLogs.id, log.id));
                    } else {
                        // Exponential backoff or simple delay
                        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                    }
                }
            }
        }

        // Process and persist jobs
        const persistedJobs = await this.persistJobs(userId, allJobs);

        return {
            jobs: persistedJobs,
            totalFound,
            errors: allErrors.length > 0 ? allErrors : undefined,
        };
    }

    /**
     * Persists jobs to the database with batched deduplication.
     */
    private async persistJobs(userId: string, incomingJobs: NormalizedJob[]): Promise<NormalizedJob[]> {
        if (incomingJobs.length === 0) return [];

        const jobsToInsert = incomingJobs.map(job => ({
            userId,
            title: job.title,
            company: job.company,
            location: job.location,

            // New Structured Fields
            city: job.city,
            state: job.state,
            country: job.country,
            postalCode: job.postalCode,
            latitude: job.latitude,
            longitude: job.longitude,

            workMode: job.workMode || "unknown",
            experienceLevel: job.experienceLevel || "not-specified",
            employmentType: job.employmentType,

            salarySnippet: job.salarySnippet,
            minSalary: this.validateNumber(job.minSalary),
            maxSalary: this.validateNumber(job.maxSalary),
            salaryCurrency: job.salaryCurrency || "USD",
            salaryUnit: job.salaryUnit,

            description: job.description,
            descriptionHtml: job.descriptionHtml,
            snippet: job.snippet,

            skills: job.skills,
            benefits: job.benefits,
            qualifications: job.qualifications,
            responsibilities: job.responsibilities,

            sourceUrl: job.sourceUrl,
            sourceName: job.sourceName,
            sourceId: job.sourceId,

            applicationsCount: this.validateNumber(job.applicationsCount),
            recruiterName: job.recruiterName,
            recruiterUrl: job.recruiterUrl,

            companyWebsite: job.companyWebsite,
            companyIndustry: job.companyIndustry,
            companyLogo: job.companyLogo,
            companyRevenue: job.companyRevenue,
            companyEmployeesCount: job.companyEmployeesCount,
            companyRating: job.companyRating,
            companyRatingsCount: this.validateNumber(job.companyRatingsCount),
            companyCeoName: job.companyCeoName,
            companyDescription: job.companyDescription,

            technographics: job.technographics,
            hash: job.hash || calculateJobHash(job.title, job.company, job.location, job.city),
            metadata: job.metadata,
            sourceActorId: job.sourceActorId,
            rawContent: job.rawContent,
        }));

        // Deduplicate within the batch to prevent Postgres error 21000
        const uniqueJobs = Array.from(
            new Map(jobsToInsert.map(j => [j.hash, j])).values()
        );

        try {
            // Batch upsert: Insert new, or skip existing based on (userId, hash)
            const persisted = await db.insert(jobs)
                .values(uniqueJobs)
                .onConflictDoUpdate({
                    target: [jobs.userId, jobs.hash],
                    set: {
                        updatedAt: new Date(),
                        sourceUrl: jobs.sourceUrl,
                        salarySnippet: jobs.salarySnippet,
                        minSalary: jobs.minSalary,
                        maxSalary: jobs.maxSalary,
                        applicationsCount: jobs.applicationsCount,
                        companyRating: jobs.companyRating,
                        companyRatingsCount: jobs.companyRatingsCount,
                    }
                })
                .returning();

            return persisted as unknown as NormalizedJob[];
        } catch (error) {
            console.error("Failed to batch persist jobs:", error);
            return [];
        }
    }

    /**
     * Hydrates a specific job with deep data (TheirStack).
     * Guarded to run only once per job.
     */
    public async hydrateJob(userId: string, jobId: string, hydrator: any): Promise<boolean> {
        try {
            const job = await db.query.jobs.findFirst({
                where: and(
                    eq(jobs.id, jobId),
                    eq(jobs.userId, userId)
                ),
            });

            if (!job) throw new Error("Job not found");

            // Guard: If already hydrated with both description and tech stack, skip
            if (job.description && job.technographics && job.technographics.length > 0) {
                return true;
            }

            const deepData = await hydrator.hydrate(job.sourceId);
            if (!deepData) return false;

            await db.update(jobs)
                .set({
                    description: deepData.description || job.description,
                    technographics: deepData.technographics || job.technographics,
                    companyWebsite: deepData.companyWebsite || job.companyWebsite,
                    salarySnippet: deepData.salarySnippet || job.salarySnippet,
                    minSalary: this.validateNumber(deepData.minSalary) || job.minSalary,
                    maxSalary: this.validateNumber(deepData.maxSalary) || job.maxSalary,
                    updatedAt: new Date(),
                })
                .where(eq(jobs.id, jobId));

            // Trigger embedding update
            void updateJobEmbedding(userId, jobId);

            return true;
        } catch (error) {
            console.error("Hydration Service Error:", error);
            return false;
        }
    }
}
