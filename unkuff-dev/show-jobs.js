const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

async function showJobs() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        const res = await client.query(`
            SELECT title, company, location, source_name, salary_snippet, created_at 
            FROM job 
            ORDER BY created_at DESC 
            LIMIT 5;
        `);

        if (res.rows.length === 0) {
            console.log('\n📭 No jobs found in the database. Run a discovery pulse first!');
        } else {
            console.log('\n📡 RECENTLY INGESTED JOBS (TOP 5):');
            res.rows.forEach((job, i) => {
                console.log(`\n--- [ Job ${i + 1} ] ---`);
                console.log(`📌 Title    : ${job.title}`);
                console.log(`🏢 Company  : ${job.company}`);
                console.log(`📍 Location : ${job.location || 'Remote'}`);
                console.log(`⭐ Source   : ${job.source_name}`);
                console.log(`💰 Salary   : ${job.salary_snippet || 'Not disclosed'}`);
                console.log(`🕒 Ingested : ${job.created_at}`);
            });
        }

    } catch (err) {
        console.error('❌ Error reading jobs:', err.message);
    } finally {
        await client.end();
    }
}

showJobs();
