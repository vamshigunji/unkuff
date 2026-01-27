const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

async function detailJobs() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        await client.connect();
        const res = await client.query('SELECT * FROM job ORDER BY created_at DESC LIMIT 2;');

        if (res.rows.length === 0) {
            console.log('No jobs found.');
            return;
        }

        console.log('--- RAW DATABASE RECORDS (TOP 2) ---\n');
        res.rows.forEach((row, i) => {
            console.log(`RECORD #${i + 1}`);
            console.log(JSON.stringify(row, null, 2));
            console.log('\n-----------------------------------\n');
        });

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

detailJobs();
