import { pgTable, text, timestamp, index, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "@/features/auth/schema";
import { vector } from "@/db/utils";

export const profiles = pgTable("profile", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),

    // Identity & Contact
    name: text("name"),
    bio: text("bio"),
    summary: text("summary"),
    location: text("location"),

    // PII Fields - Always Encrypted at Rest
    phone: text("phone"),
    address: text("address"),
    idNumber: text("id_number"),

    // Personal Flavor for AI Grounding
    hobbies: jsonb("hobbies").$type<string[]>(),
    interests: jsonb("interests").$type<string[]>(),

    bioEmbedding: vector("bio_embedding"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
    userIdIdx: index("profile_user_id_idx").on(table.userId),
}));

export const profilesRelations = relations(profiles, ({ one, many }) => ({
    workExperience: many(workExperience),
    projects: many(projects),
    skills: many(skills),
    education: many(education),
}));

export const workExperience = pgTable("work_experience", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    profileId: text("profile_id")
        .notNull()
        .references(() => profiles.id, { onDelete: "cascade" }),
    company: text("company").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    accomplishments: jsonb("accomplishments").$type<string[]>(), // High-fidelity bits
    location: text("location"),
    startDate: timestamp("start_date"),
    endDate: timestamp("end_date"),
    isCurrent: text("is_current").default("false"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
    profileIdIdx: index("work_exp_profile_id_idx").on(table.profileId),
}));

export const workExperienceRelations = relations(workExperience, ({ one }) => ({
    profile: one(profiles, {
        fields: [workExperience.profileId],
        references: [profiles.id],
    }),
}));

export const projects = pgTable("project", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    profileId: text("profile_id")
        .notNull()
        .references(() => profiles.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    link: text("link"),
    technologies: jsonb("technologies").$type<string[]>(), // Array of strings
    startDate: timestamp("start_date"),
    endDate: timestamp("end_date"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
    profileIdIdx: index("project_profile_id_idx").on(table.profileId),
}));

export const projectsRelations = relations(projects, ({ one }) => ({
    profile: one(profiles, {
        fields: [projects.profileId],
        references: [profiles.id],
    }),
}));

export const education = pgTable("education", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    profileId: text("profile_id")
        .notNull()
        .references(() => profiles.id, { onDelete: "cascade" }),
    institution: text("institution").notNull(),
    degree: text("degree"),
    fieldOfStudy: text("field_of_study"),
    location: text("location"),
    startDate: timestamp("start_date"),
    endDate: timestamp("end_date"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
    profileIdIdx: index("edu_profile_id_idx").on(table.profileId),
}));

export const educationRelations = relations(education, ({ one }) => ({
    profile: one(profiles, {
        fields: [education.profileId],
        references: [profiles.id],
    }),
}));

export const certifications = pgTable("certification", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    profileId: text("profile_id")
        .notNull()
        .references(() => profiles.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    issuer: text("issuer").notNull(),
    issueDate: timestamp("issue_date"),
    expiryDate: timestamp("expiry_date"),
    credentialId: text("credential_id"),
    link: text("link"),
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
    profileIdIdx: index("cert_profile_id_idx").on(table.profileId),
}));

export const awards = pgTable("award", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    profileId: text("profile_id")
        .notNull()
        .references(() => profiles.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    issuer: text("issuer"),
    date: timestamp("date"),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
    profileIdIdx: index("award_profile_id_idx").on(table.profileId),
}));

export const languages = pgTable("language", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    profileId: text("profile_id")
        .notNull()
        .references(() => profiles.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    proficiency: text("proficiency"), // e.g. Native, Professional, Limited
}, (table) => ({
    profileIdIdx: index("lang_profile_id_idx").on(table.profileId),
}));

export const socialLinks = pgTable("social_link", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    profileId: text("profile_id")
        .notNull()
        .references(() => profiles.id, { onDelete: "cascade" }),
    platform: text("platform").notNull(), // LinkedIn, GitHub, Portfolio
    url: text("url").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
    profileIdIdx: index("social_link_profile_id_idx").on(table.profileId),
}));

export const skills = pgTable("skill", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    profileId: text("profile_id")
        .notNull()
        .references(() => profiles.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    level: text("level"), // Beginner, Intermediate, Expert
    category: text("category"), // e.g. Frontend, Backend, Soft Skill
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
    profileIdIdx: index("skill_profile_id_idx").on(table.profileId),
}));

export const skillsRelations = relations(skills, ({ one }) => ({
    profile: one(profiles, {
        fields: [skills.profileId],
        references: [profiles.id],
    }),
}));

export const accomplishments = pgTable("accomplishment", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    profileId: text("profile_id")
        .notNull()
        .references(() => profiles.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    impact: text("impact"),
    category: text("category"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
    profileIdIdx: index("accomplishment_profile_id_idx").on(table.profileId),
}));

export const powerStatements = pgTable("power_statement", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    profileId: text("profile_id")
        .notNull()
        .references(() => profiles.id, { onDelete: "cascade" }),
    statement: text("statement").notNull(),
    context: text("context"),
    category: text("category"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
    profileIdIdx: index("power_statement_profile_id_idx").on(table.profileId),
}));

