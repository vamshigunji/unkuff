import { db } from "@/lib/db";
import { jobs } from "@/features/jobs/schema";
import { profiles } from "@/features/profile/schema";
import { jobMatches } from "./schema";
import { eq, and, gt, inArray, desc } from "drizzle-orm";
import { calculateJobMatch, batchScoring } from "./scoring-service";
import { appEvents, EVENTS, EventType } from "@/lib/events";

/**
 * Initializes event listeners for background matching.
 * Should be called once at application startup.
 */
export function initMatchEvents() {
    console.log("[MatchService] Initializing event listeners...");

    appEvents.on(EVENTS.PROFILE_UPDATED, async (payload: { userId: string }) => {
        console.log(`[Event:ProfileUpdated] Triggering scan for user ${payload.userId}`);
        await processProfileUpdate(payload.userId);
    });

    appEvents.on(EVENTS.JOBS_INGESTED, async (payload: { jobIds: string[] }) => {
        console.log(`[Event:JobsIngested] Triggering scan for ${payload.jobIds.length} new jobs`);
        await processNewJobs(payload.jobIds);
    });
}

/**
 * Runs maintenance tasks on application startup.
 * AC3: Scheduled Maintenance (runs on app start/active)
 */
export async function runStartupMaintenance() {
    console.log("[MatchService] Running startup maintenance...");
    try {
        // Local-First: Scan all profiles (usually 1) against active jobs.
        const allProfiles = await db.query.profiles.findMany({
            columns: { userId: true }
        });

        console.log(`[Maintenance] Found ${allProfiles.length} profiles to refresh.`);

        for (const p of allProfiles) {
            await batchScoring(p.userId);
        }
        console.log("[Maintenance] Startup scan complete.");
    } catch (error) {
        console.error("[Maintenance] Failed to run startup scan:", error);
    }
}

/**
 * Re-scores all recommended jobs for a user after profile update.
 * @param userId - ID of the user whose profile changed.
 */
export async function processProfileUpdate(userId: string) {
    try {
        console.log(`[FullScan] Starting match scan for user ${userId}`);
        // Re-run batch scoring for the user
        const result = await batchScoring(userId);
        console.log(`[FullScan] Updated scores for ${result.count} jobs`);
    } catch (error) {
        console.error(`[FullScan] Failed to process profile update for ${userId}: `, error);
    }
}

/**
 * Scores specific jobs against ALL profiles.
 * @param jobIds - IDs of newly ingested jobs.
 */
export async function processNewJobs(jobIds: string[]) {
    try {
        // Fetch all profiles (Local-First assumption: usually 1 user)
        const allProfiles = await db.query.profiles.findMany({
            columns: { userId: true }
        });

        if (allProfiles.length === 0) return;

        console.log(`[NewJobs] Matching against ${allProfiles.length} profiles...`);

        // For each profile, run batch scoring (or optimized incremental scoring)
        // Re-running batchScoring(userId) is safe and easiest for consistency.
        for (const p of allProfiles) {
            await batchScoring(p.userId);
        }
    } catch (error) {
        console.error("[NewJobs] Error processing new jobs:", error);
    }
}
