import { db } from "./src/lib/db";
import { users } from "./src/features/auth/schema";
import { IngestionService } from "./src/features/ingestion/service";
import { ApifyIndeedProvider } from "./src/features/ingestion/providers/apify-indeed";
import { ApifyLinkedinProvider } from "./src/features/ingestion/providers/apify-linkedin";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function verifyRichSchema() {
    console.log("💎 Starting Robust Backend Verification...");

    // 1. Ensure test user
    const userId = "robust-test-user";
    await db.insert(users).values({
        id: userId,
        name: "Robust Tester",
        email: "robust@test.com",
        password: "hashed_password",
    }).onConflictDoNothing();

    // 2. Initialize Service with both Apify providers
    const service = new IngestionService([
        new ApifyIndeedProvider({ enabled: true }),
        new ApifyLinkedinProvider({ enabled: true })
    ]);

    // 3. Trigger Scrape: Indeed (San Francisco)
    console.log("\n📍 SCRAPE 1: Indeed (San Francisco) - Data Analyst");
    await service.run(userId, "Data Analyst", { location: "San Francisco", limit: 3 });

    // 4. Trigger Scrape: LinkedIn (San Francisco)
    console.log("\n📍 SCRAPE 2: LinkedIn (San Francisco) - Data Scientist");
    await service.run(userId, "Data Scientist", { location: "San Francisco", limit: 3 });

    // 5. Verification: Inspect the Rich Fields
    const records = await db.query.jobs.findMany({
        where: (jobs, { eq }) => eq(jobs.userId, userId),
        orderBy: (jobs, { desc }) => [desc(jobs.createdAt)],
    });

    console.log(`\n📊 Verified ${records.length} records in Database.`);

    console.log("\n🔍 DATABASE RICH FIELD INSPECTION:");
    records.forEach((job, i) => {
        console.log(`--- [ Job ${i + 1} ] ---`);
        console.log(`📌 Title: ${job.title}`);
        console.log(`🏢 Company: ${job.company}`);
        console.log(`📍 City/State: ${job.city || "N/A"}, ${job.state || "N/A"}`);
        console.log(`⭐ Rating: ${job.companyRating || "N/A"} (${job.companyRatingsCount || 0} reviews)`);
        console.log(`💰 Salary: ${job.salarySnippet || "N/A"} [Unit: ${job.salaryUnit || "N/A"}]`);
        console.log(`🎓 Exp: ${job.experienceLevel || "N/A"}`);
        console.log(`👤 Recruiter: ${job.recruiterName || "N/A"}`);
        console.log(`🛠️ Skills Count: ${job.skills?.length || 0}`);
        console.log(`🎁 Benefits Count: ${job.benefits?.length || 0}`);
        console.log(`🔗 Source: ${job.sourceName}`);
    });

    console.log("\n🏁 Robust Backend Verification Complete.");
    process.exit(0);
}

verifyRichSchema().catch(err => {
    console.error("❌ Verification Failed:", err);
    process.exit(1);
});
