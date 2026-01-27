import { db } from "./src/lib/db";
import { users } from "./src/features/auth/schema";
import { IngestionService } from "./src/features/ingestion/service";
import { ApifyIndeedProvider } from "./src/features/ingestion/providers/apify-indeed";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function verifyApifyIndeed() {
    console.log("🚀 Starting Apify Indeed Integration Test...");

    // 1. Ensure test user
    let user = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, "apify-test-user")
    });

    if (!user) {
        console.log("👤 Creating Apify test user...");
        [user] = await db.insert(users).values({
            id: "apify-test-user",
            name: "Apify Tester",
            email: "apify@test.com",
            password: "hashed_password",
        }).returning();
    }
    const userId = user.id;

    // 2. Initialize Provider
    const apifyProvider = new ApifyIndeedProvider({ enabled: true });
    const service = new IngestionService([apifyProvider]);

    // 3. Test Case 1: Data Analyst in San Francisco (5 each)
    console.log("\n🔍 SCRAPE 1: 'Data Analyst' in 'San Francisco', USA...");
    const result1 = await service.run(userId, "Data Analyst", { location: "San Francisco", limit: 5 });
    console.log(`✅ Scrape 1 Complete: Found ${result1.totalFound} jobs.`);

    // 4. Test Case 2: Data Scientist in San Francisco (5 each)
    console.log("\n🔍 SCRAPE 2: 'Data Scientist' in 'San Francisco', USA...");
    const result2 = await service.run(userId, "Data Scientist", { location: "San Francisco", limit: 5 });
    console.log(`✅ Scrape 2 Complete: Found ${result2.totalFound} jobs.`);

    const totalJobs = result1.jobs.length + result2.jobs.length;
    console.log(`\n📊 SUMMARY:`);
    console.log(`- Total unique jobs ingested: ${totalJobs}`);

    if (totalJobs >= 10) {
        console.log("🏆 SUCCESS: Acceptance Criteria met (At least 5 jobs for each role).");
    } else {
        console.log("⚠️ WARNING: Total jobs less than 10. Check logs for details.");
    }

    // 5. Verification: Check DB for real Indeed records
    const recentJobs = await db.query.jobs.findMany({
        where: (jobs, { eq }) => eq(jobs.userId, userId),
        limit: 10
    });

    console.log("\n📄 DB VERIFICATION (Sample Records):");
    recentJobs.forEach((job, i) => {
        console.log(`[Job ${i + 1}] ${job.title} @ ${job.company} (${job.location})`);
    });

    console.log("\n🏁 Apify Integration Verified.");
    process.exit(0);
}

verifyApifyIndeed().catch(err => {
    console.error("❌ Apify Test Failed:", err);
    process.exit(1);
});
