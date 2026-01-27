import { pgTable, text, timestamp, integer, uuid, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";
import { users } from "@/db/schema"; // Assumes we link to user

export const generatedResumes = pgTable("generated_resumes", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
    jobId: text("job_id").notNull(), // We'll link loosely or strict depending on job schema availability
    content: jsonb("content").notNull(), // Stores the structured JSON resume content
    atsScore: integer("ats_score"), // 0-100
    templateId: text("template_id"),
    version: integer("version").default(1),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Zod Schemas for Validation
export const insertGeneratedResumeSchema = createInsertSchema(generatedResumes);
export const selectGeneratedResumeSchema = createSelectSchema(generatedResumes);
export type GeneratedResume = z.infer<typeof selectGeneratedResumeSchema>;

// Types for Tailoring Process
export const tailoredResumeContentSchema = z.object({
    personalInfo: z.object({
        fullName: z.string(),
        email: z.string(),
        phone: z.string().optional(),
        location: z.string().optional(),
        linkedin: z.string().optional(),
    }),
    summary: z.string(),
    experience: z.array(z.object({
        company: z.string(),
        title: z.string(),
        startDate: z.string(),
        endDate: z.string().optional(),
        responsibilities: z.array(z.string()),
        description: z.string().optional(),
    })),
    education: z.array(z.object({
        institution: z.string(),
        degree: z.string(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
    })),
    skills: z.array(z.string()),
});

export type TailoredResumeContent = z.infer<typeof tailoredResumeContentSchema>;

export const tailoringRequestSchema = z.object({
    jobId: z.string().uuid(),
    templateId: z.string().optional(),
});
