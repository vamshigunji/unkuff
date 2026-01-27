
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "../src/lib/db";
import { users } from "../src/features/auth/schema";
import { jobs } from "../src/features/jobs/schema";
import { jobMatches } from "../src/features/matching/schema";
import { eq } from "drizzle-orm";

async function run() {
    console.log("🌟 Seeding Golden Roles for the perfect demo...");

    const allUsers = await db.select().from(users).where(eq(users.email, 'demo@unkuff.com'));
    if (allUsers.length === 0) {
        console.error("❌ Demo user not found.");
        process.exit(1);
    }
    const user = allUsers[0];

    const goldenJobs = [
        {
            userId: user.id,
            title: "Senior AI Engineer (LLM & Agents)",
            company: "Anthropic",
            location: "San Francisco, CA (Hybrid)",
            workMode: "hybrid" as const,
            experienceLevel: "mid-senior" as const,
            salarySnippet: "$250,000 - $350,000 + Equity",
            description: "Anthropic is looking for a Senior AI Engineer to join our Core Research team. You will be responsible for scaling RLHF pipelines and building agentic frameworks that leverage Claude's reasoning capabilities.",
            descriptionHtml: "<h3>Role Overview</h3><p>Anthropic is looking for a <strong>Senior AI Engineer</strong> to join our Core Research team.</p><h4>Responsibilities</h4><ul><li>Scale RLHF pipelines</li><li>Build agentic frameworks</li><li>Optimize LLM inference</li></ul>",
            sourceUrl: "https://anthropic.com/careers",
            sourceName: "Anthropic Careers",
            sourceId: "anthropic-1",
            status: "recommended" as const,
            hash: "anthropic-ai-engineer-1",
            metadata: { score: 98 }
        },
        {
            userId: user.id,
            title: "Staff Product Data Analyst",
            company: "Airbnb",
            location: "Remote",
            workMode: "remote" as const,
            experienceLevel: "mid-senior" as const,
            salarySnippet: "$220,000 - $280,000",
            description: "Airbnb is looking for a Staff Product Data Analyst to lead our Search & Discovery team. You will derive insights from massive datasets to improve conversion and user experience.",
            descriptionHtml: "<h3>The Role</h3><p>Airbnb is seeking a <strong>Staff Product Data Analyst</strong>.</p><h4>Key Impact</h4><ul><li>Lead Search & Discovery analytics</li><li>A/B testing at scale</li><li>Strategic product direction</li></ul>",
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
            description: "Google's HR Analytics team (Workforce Operations & Compliance) is looking for a Data Scientist to support multi-region reporting and workforce strategy.",
            descriptionHtml: "<h3>Job Opportunity</h3><p>Join Google's <strong>HR Analytics</strong> team.</p><h4>What You Will Do</h4><ul><li>Drive workforce operations analytics</li><li>Build compliance dashboards</li><li>Analyze hiring trends</li></ul>",
            sourceUrl: "https://google.com/careers",
            sourceName: "Google",
            sourceId: "google-1",
            status: "recommended" as const,
            hash: "google-ds-1",
            metadata: { score: 91 }
        }
    ];

    for (const jobData of goldenJobs) {
        // Upsert by hash
        const existing = await db.query.jobs.findFirst({
            where: (table, { eq, and }) => and(eq(table.userId, user.id), eq(table.hash, jobData.hash))
        });

        if (existing) {
            console.log(`🔄 Updating: ${jobData.title}`);
            await db.update(jobs).set(jobData).where(eq(jobs.id, existing.id));
        } else {
            console.log(`✨ Inserting: ${jobData.title}`);
            const [newJob] = await db.insert(jobs).values(jobData).returning();

            // Seed a matching score for the UI
            await db.insert(jobMatches).values({
                userId: user.id,
                jobId: newJob.id,
                score: jobData.metadata.score,
                rawSimilarity: jobData.metadata.score / 100,
            }).onConflictDoUpdate({
                target: [jobMatches.userId, jobMatches.jobId],
                set: { score: jobData.metadata.score }
            });
        }
    }

    console.log("✅ Golden Roles seeded successfully!");
}

run().catch(err => {
    console.error("❌ Seed Error:", err);
    process.exit(1);
});
