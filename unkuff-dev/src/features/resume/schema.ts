import { pgTable, text, timestamp, foreignKey, index, jsonb } from "drizzle-orm/pg-core";
import { users } from "@/features/auth/schema";

export const resumes = pgTable("resumes", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  isDefault: text("is_default").default("false"), // "true" or "false"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("resumes_user_idx").on(table.userId),
}));

export const resumeVersions = pgTable("resume_versions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  resumeId: text("resume_id")
    .notNull()
    .references(() => resumes.id, { onDelete: "cascade" }),
  versionNumber: text("version_number").notNull(), // e.g., "1.0", "1.1"
  content: jsonb("content").notNull(), // The actual resume data
  fileUrl: text("file_url"), // Optional link to a PDF/Docx
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  resumeIdIdx: index("resume_versions_resume_idx").on(table.resumeId),
}));

export type Resume = typeof resumes.$inferSelect;
export type NewResume = typeof resumes.$inferInsert;
export type ResumeVersion = typeof resumeVersions.$inferSelect;
export type NewResumeVersion = typeof resumeVersions.$inferInsert;
