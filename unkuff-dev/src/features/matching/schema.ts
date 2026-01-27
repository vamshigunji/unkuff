import { pgTable, text, integer, real, timestamp, uniqueIndex, index, jsonb } from "drizzle-orm/pg-core";
import { users } from "@/features/auth/schema";
import { jobs } from "@/features/jobs/schema";

export interface GapItem {
    missing: string;
    closest_match?: string;
    reason: string;
}

export interface GapSchema {
    gaps: GapItem[];
}

export const jobMatches = pgTable("job_match", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    jobId: text("job_id")
        .notNull()
        .references(() => jobs.id, { onDelete: "cascade" }),
    score: integer("score").notNull(), // 0-100
    rawSimilarity: real("raw_similarity"), // 0.0-1.0 for debugging
    gapAnalysis: jsonb("gap_analysis").$type<GapSchema>(),
    calculatedAt: timestamp("calculated_at").defaultNow(),
}, (table) => ({
    userJobUniqueIdx: uniqueIndex("job_match_user_job_idx").on(table.userId, table.jobId),
    userIdIdx: index("job_match_user_idx").on(table.userId),
    scoreIdx: index("job_match_score_idx").on(table.score),
}));

export const jobCriteria = pgTable("job_criteria", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    jobTitles: jsonb("job_titles").$type<string[]>().notNull(),
    countryCode: text("country_code"),
    cities: jsonb("cities").$type<string[]>(),
    workModes: jsonb("work_modes").$type<string[]>(), // remote, hybrid, onsite
    employmentTypes: jsonb("employment_types").$type<string[]>(), // fulltime, contract, parttime
    salaryMin: integer("salary_min"),
    salaryMax: integer("salary_max"),
    isActive: integer("is_active").default(1), // Using integer for boolean-like behavior if needed or just boolean
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
    userIdIdx: index("job_criteria_user_idx").on(table.userId),
}));

export type JobMatch = typeof jobMatches.$inferSelect;
export type NewJobMatch = typeof jobMatches.$inferInsert;
export type JobCriteria = typeof jobCriteria.$inferSelect;
export type NewJobCriteria = typeof jobCriteria.$inferInsert;
