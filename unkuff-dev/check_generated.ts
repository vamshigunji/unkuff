
import { db } from "./src/lib/db";
import { generatedResumes } from "./src/features/tailoring/schema";
import { users } from "./src/features/auth/schema";
import { eq } from "drizzle-orm";

async function checkGenerated() {
    const user = await db.query.users.findFirst({
        where: eq(users.email, "demo@unkuff.com")
    });

    if (!user) {
        console.log("User not found");
        return;
    }

    const resumes = await db.query.generatedResumes.findMany({
        where: eq(generatedResumes.userId, user.id)
    });

    console.log(JSON.stringify(resumes, null, 2));
    process.exit(0);
}

checkGenerated().catch(console.error);
