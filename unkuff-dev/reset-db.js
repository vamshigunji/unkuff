const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

async function reset() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        await client.query('DROP TABLE IF EXISTS job, profile, work_experience, education, skill, project, certification, award, language, social_link, "user", account, session, verification_token, authenticator CASCADE');
        await client.query('DROP TYPE IF EXISTS job_status, work_mode, experience_level CASCADE');

        console.log('✅ All tables and types dropped');

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
    }
}

reset();
