// Check jobs in the database for demo user
import 'dotenv/config';
import { db } from '../src/lib/db';
import { jobs } from '../src/features/jobs/schema';
import { eq } from 'drizzle-orm';

const DEMO_USER_ID = 'cc71d781-766d-4dcd-9c32-47ed415d0827';

async function checkJobs() {
    const userJobs = await db.select({
        id: jobs.id,
        title: jobs.title,
        company: jobs.company,
        status: jobs.status,
    }).from(jobs).where(eq(jobs.userId, DEMO_USER_ID));

    console.log(`Found ${userJobs.length} jobs for demo user:\n`);

    const byStatus: Record<string, number> = {};
    userJobs.forEach(job => {
        byStatus[job.status] = (byStatus[job.status] || 0) + 1;
        console.log(`  - ${job.title} @ ${job.company} [${job.status}]`);
    });

    console.log('\nBy status:');
    Object.entries(byStatus).forEach(([status, count]) => {
        console.log(`  ${status}: ${count}`);
    });

    process.exit(0);
}

checkJobs().catch(console.error);
