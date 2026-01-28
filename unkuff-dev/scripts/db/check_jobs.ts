
import { db } from "../../src/lib/db";
import { jobs } from "../../src/db/schema";
import { desc } from "drizzle-orm";

async function main() {
    const lastJobs = await db.query.jobs.findMany({
        orderBy: [desc(jobs.createdAt)],
        limit: 5
    });
    console.log(JSON.stringify(lastJobs, null, 2));
    process.exit(0);
}

main().catch(console.error);
