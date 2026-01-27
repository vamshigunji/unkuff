
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "../src/lib/db";
import { users } from "../src/features/auth/schema";
import { jobCriteria } from "../src/features/matching/schema";
import { jobs } from "../src/features/jobs/schema";
import { eq, and } from "drizzle-orm";

async function verify() {
    console.log("🕵️  Verifying " + "Marriage" + " for demo@unkuff.com...");

    const user = await db.query.users.findFirst({
        where: eq(users.email, 'demo@unkuff.com')
    });

    if (!user) {
        console.error("❌ Demo user not found.");
        process.exit(1);
    }

    // 1. Fetch Active Criteria
    const criteria = await db.select().from(jobCriteria).where(
        and(eq(jobCriteria.userId, user.id), eq(jobCriteria.isActive, 1))
    );

    const activeTitles = criteria.flatMap(c => c.jobTitles.map(t => t.toLowerCase()));
    console.log("\n📋 Active Criteria Titles:");
    activeTitles.forEach(t => console.log(`   - ${t}`));

    // 2. Fetch Jobs intended for Kanban (Recommended)
    // We'll mimic the filtering logic in getKanbanBoardData
    console.log("\n🗂️  Kanban Board [For You] Inspection:");

    const userJobs = await db.select().from(jobs).where(
        and(eq(jobs.userId, user.id), eq(jobs.status, 'recommended'))
    );

    let passed = 0;
    let failed = 0;
    const violations: string[] = [];

    userJobs.forEach(job => {
        const isMatch = activeTitles.some(title => job.title.toLowerCase().includes(title));
        if (isMatch) {
            console.log(`   ✅ [MATCH] ${job.title} (${job.company})`);
            passed++;
        } else {
            console.log(`   ❌ [VIOLATION] ${job.title} (${job.company})`);
            failed++;
            violations.push(`${job.title} (${job.company})`);
        }
    });

    if (userJobs.length === 0) {
        console.log("   ⚠️  No jobs found in recommended column.");
    }

    console.log("\n📊 Verification Stats:");
    console.log(`   Total Jobs: ${userJobs.length}`);
    console.log(`   Passed: ${passed}`);
    console.log(`   Violations: ${failed}`);

    const confidenceScore = userJobs.length > 0 ? (passed / userJobs.length) * 100 : 0;

    console.log(`\n💎 Confidence Score: ${confidenceScore.toFixed(0)}%`);

    if (failed > 0) {
        console.error(`\n🚨 FAILED: Found ${failed} violations of the Job Criteria!`);
        process.exit(1);
    } else {
        console.log("\n✨ SUCCESS: Kanban board is perfectly married to Job Criteria.");
    }
}

verify().catch(err => {
    console.error("Verification Error:", err);
    process.exit(1);
});
