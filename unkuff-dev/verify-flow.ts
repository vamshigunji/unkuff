import { IngestionService } from "./src/features/ingestion/service";
import { ArbeitnowProvider } from "./src/features/ingestion/providers/arbeitnow";
import { MockProvider } from "./src/features/ingestion/providers/mock-provider";
import { TheirStackProvider } from "./src/features/ingestion/providers/theirstack";
import { db } from "./src/lib/db";
import { users } from "./src/features/auth/schema";
import { eq } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function testFlow() {
    console.log("🚀 Starting Backend Integration Test...");

    // 1. Ensure we have a test user
    let user = await db.query.users.findFirst();
    if (!user) {
        console.log("👤 Creating test user...");
        [user] = await db.insert(users).values({
            name: "Test User",
            email: "test@example.com",
            password: "hashed_password",
        }).returning();
    }
    const userId = user.id;
    console.log(`✅ Using User: ${user.name} (${userId})`);

    // 2. Initialize Ingestion Service with Arbeitnow (No Auth) and Mock
    const providers = [
        new ArbeitnowProvider({ enabled: true }),
        new MockProvider({ enabled: true })
    ];
    const service = new IngestionService(providers);

    // 3. Run Discovery
    console.log("\n🔍 Running Discovery for 'Typescript'...");
    const result = await service.run(userId, "Typescript");

    console.log(`📊 Discovery Complete!`);
    console.log(`- Total Found: ${result.totalFound}`);
    console.log(`- Successfully Persisted: ${result.jobs.length}`);

    if (result.jobs.length > 0) {
        const firstJob = result.jobs[0];
        console.log(`\n📄 Sample Job Found:`);
        console.log(`- Title: ${firstJob.title}`);
        console.log(`- Company: ${firstJob.company}`);
        console.log(`- Source: ${firstJob.sourceName}`);

        // 4. Test Hydration (using Mock/Manual)
        // Since TheirStack needs a key, we'll demonstrate the service's hydration logic 
        // by passing a mock hydrator.
        console.log(`\n💧 Testing Hydration Logic for Job: ${firstJob.id}`);

        const mockHydrator = {
            name: "TheirStack",
            hydrate: async (sourceId: string) => ({
                description: "This is a deeply hydrated description from the AI backend.",
                technographics: ["React", "Postgres", "Drizzle"],
                companyWebsite: "https://example.com"
            })
        };

        const hydrated = await service.hydrateJob(userId, firstJob.id!, mockHydrator);

        if (hydrated) {
            const updatedJob = await db.query.jobs.findFirst({
                where: (jobs, { eq }) => eq(jobs.id, firstJob.id!)
            });
            console.log("✅ Hydration Successful!");
            console.log(`- Updated Description: ${updatedJob?.description?.substring(0, 50)}...`);
            console.log(`- Tech Stack: ${updatedJob?.technographics?.join(", ")}`);
        }
    }

    console.log("\n🏁 Flow Verification Complete!");
    process.exit(0);
}

testFlow().catch(err => {
    console.error("❌ Test Failed:", err);
    process.exit(1);
});
