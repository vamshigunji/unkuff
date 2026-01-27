"use server";

import { IngestionService } from "./service";
import { getEnabledProviders } from "./provider-registry";
import { auth } from "@/auth";
import { appEvents, EVENTS } from "@/lib/events";

export async function discoverJobs(query: string, location?: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    // Default configuration for MVP
    const providerConfigs = {
        jooble: { enabled: !!process.env.JOOBLE_API_KEY },
        arbeitnow: { enabled: true },
        mock: { enabled: process.env.NODE_ENV === "development" }
    };

    const providers = getEnabledProviders(providerConfigs);
    const service = new IngestionService(providers);

    try {
        const result = await service.run(session.user.id, query, { location });
        if (result.jobs.length > 0) {
            appEvents.emit(EVENTS.JOBS_INGESTED, { jobIds: result.jobs.map(j => j.id) });
        }
        return { data: result };
    } catch (error) {
        console.error("Discovery Action Error:", error);
        return { error: "Failed to discover jobs" };
    }
}

export async function hydrateJobAction(jobId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    const providerConfigs = {
        theirstack: { enabled: true, apiKey: process.env.THEIRSTACK_API_KEY }
    };

    const providers = getEnabledProviders(providerConfigs);
    const service = new IngestionService(providers);
    const theirstack = providers.find(p => p.name === "TheirStack");

    if (!theirstack) {
        return { error: "Hydration provider not configured" };
    }

    try {
        const success = await service.hydrateJob(session.user.id, jobId, theirstack);
        return { success };
    } catch (error) {
        console.error("Hydration Action Error:", error);
        return { error: "Failed to hydrate job" };
    }
}
