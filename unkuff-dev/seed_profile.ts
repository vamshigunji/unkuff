
import { db } from "./src/lib/db";
import { profiles, workExperience, skills, education } from "./src/db/schema";
import { users } from "./src/features/auth/schema";
import { eq } from "drizzle-orm";

async function seedProfile() {
    console.log("🌱 Seeding Demo Profile...");

    const user = await db.query.users.findFirst({
        where: eq(users.email, "demo@unkuff.com")
    });

    if (!user) {
        console.error("❌ Demo user not found. Run create-login-user first.");
        return;
    }

    // Check if profile exists
    const existingProfile = await db.query.profiles.findFirst({
        where: eq(profiles.userId, user.id)
    });

    if (existingProfile) {
        console.log("✅ Profile already exists for demo user.");
        process.exit(0);
    }

    const [profile] = await db.insert(profiles).values({
        userId: user.id,
        name: "Demo Candidate",
        bio: "Experienced Data Scientist with a focus on machine learning and product growth. Skilled in Python, SQL, and building scalable data products.",
        summary: "Data Scientist @ Tech Corp | Machine Learning Specialist",
        location: "San Francisco, CA",
        phone: "123-456-7890",
    }).returning();

    await db.insert(workExperience).values([
        {
            profileId: profile.id,
            company: "Tech Corp",
            title: "Senior Data Scientist",
            location: "Remote",
            startDate: new Date("2020-01-01"),
            isCurrent: "true",
            description: "Leading the machine learning team to optimize conversion rates. Reduced churn by 15% using predictive modeling.",
        },
        {
            profileId: profile.id,
            company: "Startup Inc",
            title: "Data Scientist",
            location: "SF",
            startDate: new Date("2018-06-01"),
            endDate: new Date("2019-12-31"),
            isCurrent: "false",
            description: "Built the initial data pipeline using Airflow and Snowflake. Implemented A/B testing framework.",
        }
    ]);

    await db.insert(skills).values([
        { profileId: profile.id, name: "Python" },
        { profileId: profile.id, name: "SQL" },
        { profileId: profile.id, name: "PyTorch" },
        { profileId: profile.id, name: "Machine Learning" },
        { profileId: profile.id, name: "Product Analytics" }
    ]);

    await db.insert(education).values([
        {
            profileId: profile.id,
            institution: "Stanford University",
            degree: "MS",
            fieldOfStudy: "Computer Science",
            startDate: new Date("2016-09-01"),
            endDate: new Date("2018-06-01"),
        }
    ]);

    console.log("✨ Demo Profile Seeded Successfully!");
    process.exit(0);
}

seedProfile().catch(console.error);
