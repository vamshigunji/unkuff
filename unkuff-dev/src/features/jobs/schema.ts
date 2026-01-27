import { pgTable, text, timestamp, index, jsonb, pgEnum, integer, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "@/features/auth/schema";
import { vector } from "@/db/utils";

export const jobStatusEnum = pgEnum("job_status", [
    "recommended",
    "applied",
    "interviewing",
    "offer",
    "rejected",
    "archived",
]);

export const workModeEnum = pgEnum("work_mode", [
    "remote",
    "hybrid",
    "on-site",
    "unknown",
]);

export const experienceLevelEnum = pgEnum("experience_level", [
    "internship",
    "entry",
    "associate",
    "mid-senior",
    "director",
    "executive",
    "not-specified",
]);

export const jobs = pgTable("job", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),

    // Core Identity
    title: text("title").notNull(),
    company: text("company").notNull(),
    location: text("location"), // Physical location string

    // Structured Location
    city: text("city"),
    state: text("state"),
    country: text("country"),
    postalCode: text("postal_code"),
    latitude: text("latitude"), // Storing as text for simplicity or use doublePrecision
    longitude: text("longitude"),

    workMode: workModeEnum("work_mode").default("unknown"),
    experienceLevel: experienceLevelEnum("experience_level").default("not-specified"),
    employmentType: text("employment_type"), // Full-time, Contract, etc.

    // Compensation (Multi-dimensional)
    salarySnippet: text("salary_snippet"), // Raw text like "$120k - $150k"
    minSalary: integer("min_salary"),
    maxSalary: integer("max_salary"),
    salaryCurrency: text("salary_currency").default("USD"),
    salaryUnit: text("salary_unit"), // Year, Month, Hour

    // Description & Analytics
    description: text("description"),
    descriptionHtml: text("description_html"),
    snippet: text("snippet"),

    // Extracted Arrays
    skills: jsonb("skills").$type<string[]>(),
    benefits: jsonb("benefits").$type<string[]>(),
    qualifications: jsonb("qualifications").$type<string[]>(),
    responsibilities: jsonb("responsibilities").$type<string[]>(),

    // Traceability & Deep Linking
    sourceUrl: text("source_url").notNull(), // Scraper URL
    applyUrl: text("apply_url"), // Direct apply URL
    sourceName: text("source_name").notNull(),
    sourceId: text("source_id").notNull(),
    sourceActorId: text("source_actor_id"), // e.g., "valig/indeed-jobs-scraper"

    // LinkedIn specific but good for all
    applicationsCount: integer("applications_count"),
    recruiterName: text("recruiter_name"),
    recruiterUrl: text("recruiter_url"),

    // Company Intelligence
    companyWebsite: text("company_website"),
    companyIndustry: text("company_industry"),
    companyLogo: text("company_logo"),
    companyRevenue: text("company_revenue"),
    companyEmployeesCount: text("company_employees_count"),
    companyRating: text("company_rating"), // Storing as text or double
    companyRatingsCount: integer("company_ratings_count"),
    companyCeoName: text("company_ceo_name"),
    companyDescription: text("company_description"),

    // AI & Matcher Data
    technographics: jsonb("technographics").$type<string[]>(),
    embedding: vector("embedding"),
    hash: text("hash").notNull(),

    // State Management
    status: jobStatusEnum("status").default("recommended").notNull(),
    postedAt: timestamp("posted_at"),
    metadata: jsonb("metadata"), // Normalized catch-all
    notes: text("notes"), // Candidate insights & interview notes
    rawContent: jsonb("raw_content"), // COMPLETE UNFILTERED DATA PRESERVATION

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
    userIdIdx: index("job_user_id_idx").on(table.userId),
    hashIdx: index("job_hash_idx").on(table.hash),
    uniqueJobIdx: uniqueIndex("job_unique_idx").on(table.userId, table.hash),
    statusIdx: index("job_status_idx").on(table.status),
    titleIdx: index("job_title_lookup_idx").on(table.title),
    // embeddingIdx removed - btree cannot index 1536d vectors. Use HNSW/IVFFlat via raw SQL migration if needed later.
    companyIdx: index("job_company_idx").on(table.company),
}));

export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;
