
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "../src/lib/db";
import { users } from "../src/features/auth/schema";
import { profiles, workExperience, skills, education } from "../src/features/profile/schema";
import { eq } from "drizzle-orm";

async function run() {
    console.log("🚀 Starting profile population...");

    // 1. Get the first user
    const allUsers = await db.select().from(users);
    if (allUsers.length === 0) {
        console.error("❌ No users found in database. Please sign in first.");
        process.exit(1);
    }
    const user = allUsers[0];
    console.log(`👤 Found user: ${user.name || user.email} (ID: ${user.id})`);

    // 2. Clear existing profile data for this user to avoid duplicates in this experiment
    const existingProfile = await db.query.profiles.findFirst({
        where: eq(profiles.userId, user.id)
    });

    let profileId: string;

    if (existingProfile) {
        console.log("🔄 Updating existing profile...");
        profileId = existingProfile.id;
        await db.update(profiles).set({
            name: "Venkata Vamshi Krishna Gunji",
            summary: "Computer Science graduate with experience in HR Analytics at Google and AR/VR-enabled operational analytics at the National Science Foundation. Proficient in SQL, Python, and statistical analysis.",
            updatedAt: new Date()
        }).where(eq(profiles.id, profileId));

        // Clear children for clean slate in this real experiment
        await db.delete(workExperience).where(eq(workExperience.profileId, profileId));
        await db.delete(skills).where(eq(skills.profileId, profileId));
        await db.delete(education).where(eq(education.profileId, profileId));
    } else {
        console.log("✨ Creating new profile...");
        const [newProfile] = await db.insert(profiles).values({
            userId: user.id,
            name: "Venkata Vamshi Krishna Gunji",
            summary: "Computer Science graduate with experience in HR Analytics at Google and AR/VR-enabled operational analytics at the National Science Foundation. Proficient in SQL, Python, and statistical analysis.",
        }).returning();
        profileId = newProfile.id;
    }

    // 3. Insert Work Experience
    console.log("💼 Inserting work experience...");
    await db.insert(workExperience).values([
        {
            profileId,
            company: "Google",
            title: "Data Analyst — HR Analytics (Workforce Operations & Compliance)",
            description: "Supported Google HR Analytics with a focus on workforce operations and compliance, delivering multi-region, company-wide reporting.",
            accomplishments: [
                "Built dashboards and recurring reports for monthly business reviews, tracking workforce growth, headcount, and budgeting signals.",
                "Produced descriptive and diagnostic analyses to identify workforce trends and compliance-relevant patterns.",
                "Conducted trend-based and statistical analyses for hiring demand and attrition, supporting workforce strategy discussions."
            ],
            startDate: new Date("2020-01-01"),
            endDate: new Date("2021-01-01"),
            isCurrent: "false"
        },
        {
            profileId,
            company: "National Science Foundation",
            title: "Research Analyst — AR/VR–Enabled Operational Analytics",
            description: "Contributed to a National Science Foundation–funded research project focused on reducing operational and scheduling overruns in large-scale infrastructure projects.",
            accomplishments: [
                "Analyzed schedule and cost overruns using augmented and virtual reality (AR/VR) to visualize building systems and construction timelines.",
                "Identified sequencing conflicts across HVAC, electrical, and plumbing systems that historically caused rework and delays.",
                "Quantified improvement opportunities contributing to an estimated ~$6M in cost savings and a ~49% reduction in scheduling overruns."
            ],
            startDate: new Date("2018-01-01"),
            endDate: new Date("2019-12-31"),
            isCurrent: "false"
        }
    ]);

    // 4. Insert Education
    console.log("🎓 Inserting education...");
    await db.insert(education).values({
        profileId,
        institution: "California State University, Fresno",
        degree: "Master of Science in Computer Science",
        fieldOfStudy: "Computer Science"
    });

    // 5. Insert Skills
    console.log("🛠️ Inserting skills...");
    const skillList = ["SQL", "Python", "Statistical Analysis", "HR Analytics", "Workforce Planning", "AR/VR", "Operational Analytics", "Dashboarding", "Data Visualization"];
    await db.insert(skills).values(
        skillList.map(name => ({
            profileId,
            name,
            category: "Technical"
        }))
    );

    console.log("✅ Profile populated successfully!");
}

run().catch(err => {
    console.error("❌ Error populating profile:", err);
    process.exit(1);
});
