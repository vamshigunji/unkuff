// Seed script to populate test jobs for the Demo Candidate user
// Run with: npx tsx --env-file=.env.local scripts/seed-demo-jobs.ts

import 'dotenv/config';
import { db } from '../src/lib/db';
import { jobs } from '../src/features/jobs/schema';

const DEMO_USER_ID = 'cc71d781-766d-4dcd-9c32-47ed415d0827';

const testJobs = [
    {
        title: 'Senior Frontend Developer',
        company: 'TechCorp Inc.',
        location: 'San Francisco, CA',
        workMode: 'remote' as const,
        salarySnippet: '$150k - $180k',
        minSalary: 150000,
        maxSalary: 180000,
        status: 'recommended' as const,
        metadata: { score: 95, atsScore: 88 },
    },
    {
        title: 'Full Stack Engineer',
        company: 'StartupXYZ',
        location: 'New York, NY',
        workMode: 'hybrid' as const,
        salarySnippet: '$130k - $160k',
        minSalary: 130000,
        maxSalary: 160000,
        status: 'recommended' as const,
        metadata: { score: 87, atsScore: 92 },
    },
    {
        title: 'React Developer',
        company: 'WebAgency Pro',
        location: 'Austin, TX',
        workMode: 'remote' as const,
        salarySnippet: '$120k - $145k',
        minSalary: 120000,
        maxSalary: 145000,
        status: 'recommended' as const,
        metadata: { score: 82, atsScore: 75 },
    },
    {
        title: 'TypeScript Engineer',
        company: 'DataFlow Systems',
        location: 'Seattle, WA',
        workMode: 'on-site' as const,
        salarySnippet: '$140k - $170k',
        minSalary: 140000,
        maxSalary: 170000,
        status: 'recommended' as const,
        metadata: { score: 91, atsScore: 96 },
    },
    {
        title: 'UI/UX Developer',
        company: 'DesignFirst Co.',
        location: 'Los Angeles, CA',
        workMode: 'remote' as const,
        salarySnippet: '$110k - $135k',
        minSalary: 110000,
        maxSalary: 135000,
        status: 'recommended' as const,
        metadata: { score: 78, atsScore: 82 },
    },
    {
        title: 'Software Engineer II',
        company: 'MegaCorp Industries',
        location: 'Denver, CO',
        workMode: 'hybrid' as const,
        salarySnippet: '$125k - $155k',
        minSalary: 125000,
        maxSalary: 155000,
        status: 'applied' as const,
        metadata: { score: 88, atsScore: 90 },
    },
    {
        title: 'Frontend Architect',
        company: 'CloudScale Tech',
        location: 'Chicago, IL',
        workMode: 'remote' as const,
        salarySnippet: '$170k - $200k',
        minSalary: 170000,
        maxSalary: 200000,
        status: 'applied' as const,
        metadata: { score: 93, atsScore: 85 },
    },
    {
        title: 'JavaScript Developer',
        company: 'AppBuilder LLC',
        location: 'Miami, FL',
        workMode: 'on-site' as const,
        salarySnippet: '$100k - $125k',
        minSalary: 100000,
        maxSalary: 125000,
        status: 'interviewing' as const,
        metadata: { score: 75, atsScore: 88 },
    },
];

async function seedDemoJobs() {
    console.log('🌱 Seeding test jobs for Demo Candidate...');
    console.log(`📧 User ID: ${DEMO_USER_ID}`);

    // Insert test jobs
    for (const job of testJobs) {
        const hash = `demo-${job.company.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

        await db.insert(jobs).values({
            userId: DEMO_USER_ID,
            title: job.title,
            company: job.company,
            location: job.location,
            workMode: job.workMode,
            salarySnippet: job.salarySnippet,
            minSalary: job.minSalary,
            maxSalary: job.maxSalary,
            salaryCurrency: 'USD',
            status: job.status,
            sourceUrl: `https://example.com/jobs/${hash}`,
            sourceName: 'Test Seed',
            sourceId: hash,
            hash,
            metadata: job.metadata,
            postedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        });

        console.log(`  ✅ Added: ${job.title} at ${job.company} (${job.status})`);
    }

    console.log('\n🎉 Seed complete! Refresh the dashboard to see the jobs.');
    process.exit(0);
}

seedDemoJobs().catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
});
