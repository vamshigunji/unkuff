import { pgTable, uuid, varchar, integer, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "@/features/auth/schema"; // Import users table for foreign key

export const discoveryProgress = pgTable("discovery_progress", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }), // Foreign key to users
    status: varchar("status", { enum: ["in_progress", "completed", "failed"] }).notNull(),
    currentStep: integer("current_step").notNull().default(0),
    totalSteps: integer("total_steps").notNull().default(0),
    percentage: integer("percentage").notNull().default(0),
    message: text("message"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
