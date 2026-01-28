
import { db } from "../../src/lib/db";
import { profiles, workExperience, skills, education } from "../../src/db/schema";
import { users } from "../../src/features/auth/schema";
import { eq } from "drizzle-orm";

async function checkProfile() {
    const user = await db.query.users.findFirst({
        where: eq(users.email, "demo@unkuff.com")
    });

    if (!user) {
        console.log("User not found");
        return;
    }

    const profile = await db.query.profiles.findFirst({
        where: eq(profiles.userId, user.id),
        with: {
            workExperience: true,
            skills: true,
            education: true
        }
    });

    console.log(JSON.stringify(profile, null, 2));
    process.exit(0);
}

checkProfile().catch(console.error);
