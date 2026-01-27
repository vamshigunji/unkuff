const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

async function inspect() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        const tablesRes = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);

        console.log('\n📊 Tables found in "public" schema:');
        for (const row of tablesRes.rows) {
            const countRes = await client.query(`SELECT COUNT(*) FROM "${row.table_name}"`);
            console.log(`- ${row.table_name.padEnd(20)} (${countRes.rows[0].count} records)`);
        }

        console.log('\n🔍 Schema Check:');
        const schemaRes = await client.query(`
            SELECT table_name, column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'public'
            ORDER BY table_name, ordinal_position;
        `);

        let currentTable = '';
        schemaRes.rows.forEach(col => {
            if (col.table_name !== currentTable) {
                console.log(`\nTable: ${col.table_name}`);
                currentTable = col.table_name;
            }
            console.log(`  └─ ${col.column_name.padEnd(15)} [${col.data_type}]`);
        });

    } catch (err) {
        console.error('❌ Error inspecting database:', err.message);
    } finally {
        await client.end();
    }
}

inspect();
