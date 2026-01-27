
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "../src/lib/db";
import { users } from "../src/features/auth/schema";
import { jobCriteria } from "../src/features/matching/schema";

async function run() {
    console.log("🚀 Starting criteria population...");

    const allUsers = await db.select().from(users);
    if (allUsers.length === 0) {
        console.error("❌ No users found.");
        process.exit(1);
    }
    const user = allUsers[0];
    console.log(`👤 Using user: ${user.name || user.email} (ID: ${user.id})`);

    await db.insert(jobCriteria).values([
        {
            userId: user.id,
            name: "Data Science Roles",
            jobTitles: ["Data Scientist", "Senior Data Scientist", "Staff Data Scientist"],
            countryCode: "US",
            isActive: 1
        },
        {
            userId: user.id,
            name: "Product Analytics",
            jobTitles: ["Product Data Analyst", "Senior Product Analyst", "Analytics Manager"],
            countryCode: "US",
            isActive: 1
        }
    ]);

    console.log("✅ Criteria populated successfully!");
}

run().catch(err => {
    console.error("❌ Error populating criteria:", err);
    process.exit(1);
});
