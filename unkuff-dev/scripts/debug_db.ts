
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
    try {
        console.log("Checking migrations table...");
        // Default table name usually '__drizzle_migrations' in 'drizzle' schema or 'public' depend on config
        // Actually default is 'drizzle' schema, table '__drizzle_migrations'? Or just public.
        // Let's check information schema.

        const tables = await pool.query("SELECT table_schema, table_name FROM information_schema.tables WHERE table_name LIKE '%drizzle%'");
        console.log("Drizzle tables:", tables.rows);

        const publicTables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
        console.log("Public tables:", publicTables.rows.map(r => r.table_name));

    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}

check();
