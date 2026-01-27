
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "../src/lib/db";
import { users } from "../src/features/auth/schema";
import { jobCriteria } from "../src/features/matching/schema";
import { jobs } from "../src/features/jobs/schema";
import { jobMatches } from "../src/features/matching/schema";
import { eq, and } from "drizzle-orm";

async function run() {
    console.log("🧹 Cleaning slate for demo@unkuff.com...");

    const user = await db.query.users.findFirst({
        where: eq(users.email, 'demo@unkuff.com')
    });
    if (!user) throw new Error("User not found");

    // Clear everything related to job discovery for this user
    await db.delete(jobCriteria).where(eq(jobCriteria.userId, user.id));
    await db.delete(jobs).where(and(eq(jobs.userId, user.id), eq(jobs.status, 'recommended')));
    await db.delete(jobMatches).where(eq(jobMatches.userId, user.id));

    console.log("✅ Database cleaned.");

    // 1. Insert ONLY the intended criteria
    console.log("✨ Seeding fresh active criteria...");
    await db.insert(jobCriteria).values([
        {
            userId: user.id,
            name: "Product Analytics",
            jobTitles: ["Product Data Analyst", "Senior Product Analyst", "Staff Product Analyst"],
            countryCode: "US",
            isActive: 1,
        },
        {
            userId: user.id,
            name: "Data Science Roles",
            jobTitles: ["Data Scientist", "Senior Data Scientist", "Staff Data Scientist"],
            countryCode: "US",
            isActive: 1,
        }
    ]);

    // 2. Insert ONLY valid Golden Roles
    console.log("💎 Seeding verified Golden Roles...");
    const goldenJobs = [
        {
            userId: user.id,
            title: "Staff Product Data Analyst",
            company: "Airbnb",
            location: "Remote",
            workMode: "remote" as const,
            experienceLevel: "mid-senior" as const,
            salarySnippet: "$220,000 - $280,000",
            description: "Airbnb is looking for a Staff Product Data Analyst to lead our Search & Discovery team.",
            descriptionHtml: "<h3>The Role</h3><p>Airbnb is seeking a <strong>Staff Product Data Analyst</strong>.</p>",
            sourceUrl: "https://airbnb.com/careers",
            sourceName: "Airbnb",
            sourceId: "airbnb-1",
            status: "recommended" as const,
            hash: "airbnb-product-analyst-1",
            metadata: { score: 94 }
        },
        {
            userId: user.id,
            title: "Senior Data Scientist",
            company: "Google",
            location: "Mountain View, CA",
            workMode: "on-site" as const,
            experienceLevel: "mid-senior" as const,
            salarySnippet: "$180,000 - $260,000",
            description: "Join Google's HR Analytics team.",
            descriptionHtml: "<h3>Job Opportunity</h3><p>Join Google's <strong>HR Analytics</strong> team.</p>",
            sourceUrl: "https://google.com/careers",
            sourceName: "Google",
            sourceId: "google-1",
            status: "recommended" as const,
            hash: "google-ds-1",
            metadata: { score: 91 }
        }
    ];

    for (const jobData of goldenJobs) {
        const [newJob] = await db.insert(jobs).values(jobData).returning();
        await db.insert(jobMatches).values({
            userId: user.id,
            jobId: newJob.id,
            score: jobData.metadata.score,
            rawSimilarity: jobData.metadata.score / 100,
        });
    }

    console.log("✅ Perfect marriage restored. Run verify-marriage.ts now.");
}

run().catch(console.error);
