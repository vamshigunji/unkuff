import { db } from "../../src/lib/db";
import { users } from "../../src/features/auth/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function createLoginUser() {
    console.log("👤 Setting up Demo User...");

    const email = "demo@unkuff.com";
    const password = "password123";
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await db.query.users.findFirst({
        where: eq(users.email, email)
    });

    if (existingUser) {
        console.log("🔄 Updating existing demo user password...");
        await db.update(users)
            .set({ password: hashedPassword })
            .where(eq(users.email, email));
    } else {
        console.log("✨ Creating new demo user...");
        await db.insert(users).values({
            name: "Demo Candidate",
            email: email,
            password: hashedPassword,
        });
    }

    console.log("\n✅ User Ready!");
    console.log("📧 Email: " + email);
    console.log("🔑 Password: " + password);
    console.log("\n👉 Go to http://localhost:3000/login to access the dashboard.");
    process.exit(0);
}

createLoginUser().catch(console.error);
