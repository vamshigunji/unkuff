import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/db/schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl && process.env.NODE_ENV === "production") {
    console.warn("⚠️ DATABASE_URL is not set. Database connections will fail.");
}

const pool = new Pool({
    connectionString: databaseUrl || "postgres://localhost:5432/placeholder",
});

export const db = drizzle(pool, { schema });
