const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

async function countJobs() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        await client.connect();

        const res = await client.query('SELECT COUNT(*) FROM job;');

        const count = res.rows[0].count;
        console.log(`There are ${count} jobs in the database.`);

    } catch (err) {
        console.error('❌ Error counting jobs:', err.message);
    } finally {
        await client.end();
    }
}

countJobs();
