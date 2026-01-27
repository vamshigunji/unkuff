import { db } from "./src/lib/db";
import { users } from "./src/db/schema";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function seed() {
    console.log("🌱 Seeding database...");

    // Create test user
    const hashedPassword = await bcrypt.hash("Test123!", 12);

    try {
        await db.insert(users).values({
            name: "Test User",
            email: "test@unkuff.com",
            password: hashedPassword,
        }).onConflictDoNothing();

        console.log("✅ Test user created:");
        console.log("   Email: test@unkuff.com");
        console.log("   Password: Test123!");
        console.log("\n🎉 Done! You can now log in with these credentials.");
    } catch (error) {
        console.error("Error seeding:", error);
    }

    process.exit(0);
}

seed();
