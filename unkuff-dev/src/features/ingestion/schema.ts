import { pgTable, text, timestamp, index, jsonb } from "drizzle-orm/pg-core";

export const ingestionLogs = pgTable("ingestion_logs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  provider: text("provider").notNull(), // e.g., "apify-indeed", "jooble"
  status: text("status").notNull(), // "success", "failure", "in_progress"
  stats: jsonb("stats"), // e.g., { jobsFound: 10, jobsSaved: 8, errors: 0 }
  error: text("error"),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
}, (table) => ({
  providerIdx: index("ingestion_logs_provider_idx").on(table.provider),
  statusIdx: index("ingestion_logs_status_idx").on(table.status),
}));

export type IngestionLog = typeof ingestionLogs.$inferSelect;
export type NewIngestionLog = typeof ingestionLogs.$inferInsert;
