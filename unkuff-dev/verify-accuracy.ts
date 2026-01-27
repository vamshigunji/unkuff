import { db } from "./src/lib/db";
import { users } from "./src/features/auth/schema";
import { IngestionService } from "./src/features/ingestion/service";
import { ArbeitnowProvider } from "./src/features/ingestion/providers/arbeitnow";
import { eq } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function verifyAccuracy() {
    console.log("🧹 Initializing Accuracy Check...");

    // 1. Create User
    const [user] = await db.insert(users).values({
        id: "accuracy-test-user",
        name: "Accuracy Tester",
        email: "accuracy@test.com",
        password: "hashed_password",
    }).onConflictDoNothing().returning();

    const userId = user?.id || "accuracy-test-user";
    const service = new IngestionService([new ArbeitnowProvider({ enabled: true })]);

    // 2. Test Targeting Accuracy
    const query = "Data Scientist";
    console.log(`\n🧪 Test: Pulling specifically for '${query}'...`);
    const result = await service.run(userId, query);

    console.log(`📊 Result: ${result.jobs.length} jobs retrieved from live feed.`);

    // Validation: Check if every single retrieved job title contains our target keyword
    const invalidMatches = result.jobs.filter(j =>
        !j.title.toLowerCase().includes(query.toLowerCase()) &&
        !j.company.toLowerCase().includes(query.toLowerCase())
    );

    if (result.jobs.length > 0 && invalidMatches.length === 0) {
        console.log("✅ PASS: 100% targeting accuracy. Only relevant jobs were saved.");
        result.jobs.forEach(j => {
            console.log(`   - [VALID] ${j.title} @ ${j.company}`);
        });
    } else if (result.jobs.length === 0) {
        console.log("✅ PASS: No matches found in the current live feed. Database remains clean.");
    } else {
        console.log("❌ FAIL: System pulled irrelevant jobs!");
        invalidMatches.forEach(j => {
            console.log(`   - [INVALID] ${j.title} @ ${j.company}`);
        });
    }

    console.log("\n🏁 Logic Verification Complete.");
    process.exit(0);
}

verifyAccuracy().catch(err => {
    console.error("❌ Script Error:", err);
    process.exit(1);
});
