import { pgTable, text, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";

export const systemLogs = pgTable("system_logs", {
    id: uuid("id").defaultRandom().primaryKey(),
    level: text("level").notNull().default("info"), // info, error, debug, ai
    module: text("module").notNull(), // tailoring, ingestion, auth
    message: text("message").notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
