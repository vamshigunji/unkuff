// Debug script to check session user ID vs database user ID
import 'dotenv/config';
import { db } from '../src/lib/db';
import { jobs } from '../src/features/jobs/schema';
import { users } from '../src/features/auth/schema';
import { eq, count } from 'drizzle-orm';

async function debug() {
    // Get all users
    const allUsers = await db.select({
        id: users.id,
        email: users.email,
    }).from(users);

    console.log('Users in database:');
    for (const user of allUsers) {
        const jobCount = await db.select({ count: count() })
            .from(jobs)
            .where(eq(jobs.userId, user.id));
        console.log(`  ${user.email} (ID: ${user.id}) - ${jobCount[0].count} jobs`);
    }

    // Check jobs table
    const allJobs = await db.select({
        id: jobs.id,
        userId: jobs.userId,
        title: jobs.title,
        status: jobs.status,
    }).from(jobs).limit(20);

    console.log('\nFirst 20 jobs:');
    for (const job of allJobs) {
        console.log(`  [${job.status}] ${job.title} - User: ${job.userId}`);
    }

    process.exit(0);
}

debug().catch(console.error);
