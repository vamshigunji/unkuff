---
id: 7-3
title: "Job Criteria Management & Persistence"
epic: 7
priority: P2-NORMAL
status: backlog
created: 2026-01-25
tags: [criteria, user-preferences, data-model]
---

# Story 7.3: Job Criteria Management & Persistence

## User Story

As a **candidate**,
I want to **save and manage my job search criteria** (job titles, locations, work modes),
So that the system can **automatically discover matching jobs** without me re-entering search terms.

---

## Context

The `job_criteria` table already exists in the schema but is not fully utilized. This story activates the criteria management flow and connects it to the ingestion pipeline.

---

## Acceptance Criteria

### AC1: Criteria CRUD UI
- **Given** an authenticated user on the Dashboard
- **When** they access "Search Preferences" or equivalent
- **Then** they can:
  - Create a new criteria set with a name (e.g., "Data Science Remote")
  - Edit job titles (multi-select/tags input)
  - Set location preferences (country, cities)
  - Set work mode filters (remote, hybrid, on-site)
  - Set salary range expectations
  - Toggle criteria as Active/Inactive

### AC2: Criteria Persistence
- **Given** a user saves their criteria
- **When** the form is submitted
- **Then** the criteria is persisted to `job_criteria` table
- **And** a toast confirms "Criteria saved successfully"

### AC3: Multiple Criteria Sets
- **Given** a user has multiple career interests
- **When** they view their criteria list
- **Then** they see all saved criteria sets
- **And** they can activate/deactivate each independently
- **And** only active criteria are used for job recommendations

### AC4: Criteria Display in Dashboard
- **Given** a user has active criteria
- **When** they view their Kanban board
- **Then** a summary of active criteria is visible (e.g., "Searching: Data Scientist, Remote, USA")

---

## Technical Notes

### Existing Schema (already in codebase)

```typescript
// src/features/matching/schema.ts
export const jobCriteria = pgTable("job_criteria", {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id),
    name: text("name").notNull(),
    jobTitles: jsonb("job_titles").$type<string[]>().notNull(),
    countryCode: text("country_code"),
    cities: jsonb("cities").$type<string[]>(),
    workModes: jsonb("work_modes").$type<string[]>(),
    employmentTypes: jsonb("employment_types").$type<string[]>(),
    salaryMin: integer("salary_min"),
    salaryMax: integer("salary_max"),
    isActive: integer("is_active").default(1),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});
```

---

## Dependencies

- Auth infrastructure (Epic 1) ✅ DONE
- Matching schema (Story 5.1) ✅ DONE

---

## Estimation

| Aspect | Estimate |
|--------|----------|
| **Complexity** | Medium |
| **Time** | 3-4 hours |
| **Risk** | Low |
