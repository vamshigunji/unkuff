
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { IngestionService } from "../src/features/ingestion/service";
import { getEnabledProviders } from "../src/features/ingestion/provider-registry";
import { db } from "../src/lib/db";
import { jobCriteria } from "../src/features/matching/schema";
import { discoveryProgress } from "../src/features/dashboard/schema"; // Import discoveryProgress
import { eq } from "drizzle-orm";

async function run() {
    console.log("🔍 Starting discovery for all active criteria...");

    const activeCriteria = await db.select().from(jobCriteria).where(eq(jobCriteria.isActive, 1));

    if (activeCriteria.length === 0) {
        console.error("❌ No active criteria found.");
        process.exit(1);
    }

    const providerConfigs = {
        jooble: { enabled: !!process.env.JOOBLE_API_KEY },
        arbeitnow: { enabled: true },
        mock: { enabled: process.env.NODE_ENV === "development" }
    };

    const providers = getEnabledProviders(providerConfigs);
    const service = new IngestionService(providers);

    // Calculate total steps for progress tracking
    let totalSteps = 0;
    const userIds = new Set<string>();
    for (const criteria of activeCriteria) {
        totalSteps += criteria.jobTitles.length;
        userIds.add(criteria.userId);
    }

    // Initialize discovery progress for each user
    for (const userId of userIds) {
        await db.insert(discoveryProgress)
            .values({
                userId: userId,
                status: "in_progress",
                currentStep: 0,
                totalSteps: totalSteps,
                percentage: 0,
                message: "Initializing discovery...",
            })
            .onConflictDoUpdate({
                target: discoveryProgress.userId,
                set: {
                    status: "in_progress",
                    currentStep: 0,
                    totalSteps: totalSteps,
                    percentage: 0,
                    message: "Initializing discovery...",
                    updatedAt: new Date(),
                },
            });
    }

    let currentStepCount = 0;
    try {
        for (const criteria of activeCriteria) {
            console.log(`📡 Ingesting for criteria: ${criteria.name}...`);
            for (const title of criteria.jobTitles) {
                currentStepCount++;
                const percentage = Math.floor((currentStepCount / totalSteps) * 100);
                const message = `Searching for: ${title} in ${criteria.countryCode}...`;

                await db.update(discoveryProgress)
                    .set({
                        currentStep: currentStepCount,
                        percentage: percentage,
                        message: message,
                        updatedAt: new Date(),
                    })
                    .where(eq(discoveryProgress.userId, criteria.userId));

                console.log(`   🔎 ${message}`);
                const result = await service.run(criteria.userId, title, { country: criteria.countryCode });
                console.log(`   ✅ Found and persisted ${result.jobs.length} jobs for "${title}".`);
            }
        }

        // Finalize discovery progress for all users
        for (const userId of userIds) {
            await db.update(discoveryProgress)
                .set({
                    status: "completed",
                    percentage: 100,
                    message: "Discovery complete!",
                    updatedAt: new Date(),
                })
                .where(eq(discoveryProgress.userId, userId));
        }

        console.log("🚀 Discovery complete!");
    } catch (err: any) {
        // Handle errors and update progress for all users
        for (const userId of userIds) {
            await db.update(discoveryProgress)
                .set({
                    status: "failed",
                    message: `Discovery failed: ${err.message || 'Unknown error'}`,
                    updatedAt: new Date(),
                })
                .where(eq(discoveryProgress.userId, userId));
        }
        console.error("❌ Discovery Error:", err);
        process.exit(1);
    }
}

run().catch(err => {
    console.error("❌ Unhandled Discovery Error:", err);
    process.exit(1);
});
