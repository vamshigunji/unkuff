/**
 * Dev Tools Server Actions
 * Story 7.1: Dev-only ingestion trigger
 * Production Guard: This action MUST NOT run in production
 */
"use server";

import { auth } from "@/auth";
import { IngestionService } from "@/features/ingestion/service";
import { ApifyLinkedinProvider } from "@/features/ingestion/providers/apify-linkedin";
import { ApifyIndeedProvider } from "@/features/ingestion/providers/apify-indeed";
import { DevIngestionParams, DevIngestionResult } from "./types";
import { appEvents, EVENTS } from "@/lib/events";

export async function triggerDevIngestion(
    params: DevIngestionParams
): Promise<DevIngestionResult> {
    // 🛡️ PRODUCTION GUARD - This action MUST NOT run in production
    if (process.env.NODE_ENV === "production") {
        return { error: "Manual ingestion is disabled in production" };
    }

    const session = await auth();
    if (!session?.user?.id) {
        return { error: "Unauthorized - Please log in" };
    }

    // Validate required params
    if (!params.keyword || params.keyword.trim() === "") {
        return { error: "Job keyword is required" };
    }

    // Select providers based on source
    const providers = [];
    if (params.source === "linkedin" || params.source === "both") {
        providers.push(new ApifyLinkedinProvider({ enabled: true }));
    }
    if (params.source === "indeed" || params.source === "both") {
        providers.push(new ApifyIndeedProvider({ enabled: true }));
    }

    if (providers.length === 0) {
        return { error: "No valid provider selected" };
    }

    const service = new IngestionService(providers);

    try {
        console.log(`🧪 [DEV] Triggering manual ingestion: "${params.keyword}" in "${params.location}"`);
        console.log(`🧪 [DEV] Source: ${params.source}, Max Results: ${params.maxResults}`);

        const result = await service.run(session.user.id, params.keyword, {
            location: params.location || "United States",
            limit: params.maxResults,
        });

        // Calculate new vs duplicates
        const newJobs = result.jobs.length;
        const duplicates = Math.max(0, result.totalFound - newJobs);

        console.log(`🧪 [DEV] Ingestion complete: ${newJobs} new, ${duplicates} duplicates`);

        // Emit event for UI refresh
        if (result.jobs.length > 0) {
            appEvents.emit(EVENTS.JOBS_INGESTED, {
                jobIds: result.jobs.map(j => j.id)
            });
        }

        return {
            data: {
                newJobs,
                duplicates,
                totalFound: result.totalFound,
                errors: result.errors,
            },
        };
    } catch (error) {
        console.error("🧪 [DEV] Ingestion error:", error);
        return { error: String(error) };
    }
}
