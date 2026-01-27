---
id: 7-4
title: "Criteria Deduplication Engine"
epic: 7
priority: P3-LOW
status: backlog
created: 2026-01-25
tags: [optimization, cost-saving, apify]
---

# Story 7.4: Criteria Deduplication Engine

## User Story

As the **system**,
I want to **aggregate and deduplicate job criteria across all users** before triggering Apify,
So that **identical searches are only executed once**, saving API credits.

---

## Context

### The Problem

```
User A: "Data Scientist" + "San Francisco"  → Apify call #1
User B: "Data Scientist" + "San Francisco"  → Apify call #2 (DUPLICATE!)
User C: "Data Scientist" + "Remote, USA"    → Apify call #3 (different criteria - OK)
```

### The Solution

```
Aggregator identifies:
  - Criteria Set 1: "Data Scientist, San Francisco" (Users A, B)
  - Criteria Set 2: "Data Scientist, Remote, USA" (User C)

Only 2 Apify calls needed instead of 3!
```

---

## Acceptance Criteria

### AC1: Criteria Aggregation Service
- **Given** multiple users with active job_criteria
- **When** the ingestion scheduler runs
- **Then** criteria are grouped by normalized key (title + location + work_mode)
- **And** only unique criteria sets trigger Apify calls

### AC2: Criteria Normalization
- **Given** criteria from different users
- **When** comparing for deduplication
- **Then** job titles are normalized (lowercase, trimmed)
- **And** locations are normalized (city → metro area)
- **And** minor variations don't cause duplicate scrapes

### AC3: Criteria-to-Users Mapping
- **Given** a deduplicated criteria set
- **When** jobs are ingested from Apify
- **Then** the system knows which users should receive the jobs
- **And** user_job links are created for ALL matching users

### AC4: Staleness Check
- **Given** a criteria set was last scraped 2 hours ago
- **When** the same criteria is requested again
- **Then** the system skips Apify and uses cached job_pool data
- **And** only creates new user_job links for the requesting user

---

## Technical Notes

### Criteria Key Generation

```typescript
function generateCriteriaKey(criteria: JobCriteria): string {
    const titles = criteria.jobTitles.sort().map(t => t.toLowerCase().trim()).join('|');
    const locations = criteria.cities?.sort().join('|') || 'any';
    const modes = criteria.workModes?.sort().join('|') || 'any';
    return `${titles}::${locations}::${modes}`;
}
```

### Deduplication Table

```typescript
export const criteriaCache = pgTable("criteria_cache", {
    id: text("id").primaryKey(),
    criteriaKey: text("criteria_key").notNull().unique(),
    lastScrapedAt: timestamp("last_scraped_at").notNull(),
    jobCount: integer("job_count"),
});
```

---

## Dependencies

- Story 7.2 (Shared Job Pool) - prerequisite
- Story 7.3 (Criteria Management) - prerequisite

---

## Estimation

| Aspect | Estimate |
|--------|----------|
| **Complexity** | Medium |
| **Time** | 3-4 hours |
| **Risk** | Low |
