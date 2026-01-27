# Story 7.2: Shared Job Pool Architecture (Multi-Tenant Deduplication)

Status: ready-for-dev

---

## Story

As the **system**,
I want to store job postings in a **shared pool** with user-specific links,
So that **multiple users with the same criteria don't cause duplicate storage or Apify calls** and we optimize API credits and database storage.

---

## Context \& Purpose

### The Problem (Current Architecture)

The current `job` table stores jobs PER USER. If two users search for "Data Scientist, SF", we store 50 jobs twice:

```
Current: Per-User Job Storage (WASTEFUL)
┌─────────────────────────────────────────────────────────┐
│  User A searches "Data Scientist, SF"                   │
│  → 50 jobs stored with user_id = User A                 │
│                                                         │
│  User B searches "Data Scientist, SF" (same criteria!)  │
│  → 50 DUPLICATE jobs stored with user_id = User B       │
│                                                         │
│  Result: 100 rows for 50 unique jobs = 2X STORAGE WASTE │
│  + DUPLICATE Apify calls = 2X API CREDITS WASTE         │
└─────────────────────────────────────────────────────────┘
```

### The Solution (Shared Pool)

```
Target: Shared Pool + User Links (EFFICIENT)
┌─────────────────────────────────────────────────────────┐
│  job_pool (50 unique jobs, NO user_id)                  │
│  ├── id, hash, title, company, embedding, etc.          │
│                                                         │
│  user_job (lightweight links with user-specific data)   │
│  ├── user_id, job_pool_id, status, score, notes         │
│  ├── User A → 50 links to job_pool                      │
│  └── User B → 50 links to SAME jobs in job_pool         │
│                                                         │
│  Result: 50 job_pool + 100 lightweight links = 3X MORE  │
│          EFFICIENT + Apify called ONCE per unique job   │
└─────────────────────────────────────────────────────────┘
```

### Current Database State
- **Total Jobs in DB:** ~30+ (from Story 7.1 testing + previous ingestion)
- **Current Schema:** `src/features/jobs/schema.ts` with per-user `jobs` table
- **Unique Index:** `(user_id, hash)` - allows same job for different users

---

## Acceptance Criteria

### AC1: job_pool Table Schema
- **Given** the database schema
- **When** a migration is applied
- **Then** a `job_pool` table exists with:
  - `id` (UUID primary key)
  - `hash` unique constraint for global deduplication (no more per-user hash)
  - `embedding` vector(1536) column for pgvector matching
  - ALL job metadata fields (title, company, description, etc.) copied from current `jobs` table
  - `criteria_tags` JSONB for query categorization (e.g., ["data scientist", "san francisco"])
  - `scraped_at` and `last_verified_at` timestamps
  - **NO** `user_id` column (shared across all users)

### AC2: user_job Table Schema
- **Given** the `job_pool` table
- **When** a user discovers a job
- **Then** a `user_job` link record is created with:
  - `id` (UUID primary key)
  - `user_id` (FK to users, cascade delete)
  - `job_pool_id` (FK to job_pool, cascade delete)
  - `status` (jobStatusEnum: recommended, applied, interviewing, offer, rejected, archived)
  - `match_score` (integer 0-100)
  - `gap_analysis` (JSONB for Red Zone data)
  - `notes` (user-specific notes)
  - `added_at` timestamp
  - `tailored_resume_id` (nullable FK for future linking)
  - UNIQUE constraint on `(user_id, job_pool_id)`

### AC3: Migration of Existing Data
- **Given** ~30 existing jobs in the current `job` table
- **When** the migration script runs
- **Then:**
  - Unique jobs (by hash) are moved to `job_pool`
  - Corresponding `user_job` links are created preserving user-specific data (status, notes)
  - The old `job` table is renamed to `job_legacy` (not deleted, for safety)
  - All foreign key relationships remain intact
  - Zero data loss occurs

### AC4: Ingestion Service Refactor
- **Given** the new schema
- **When** jobs are ingested via `IngestionService.run()`
- **Then** the service:
  1. Calculates hash for incoming job
  2. Checks `job_pool` for existing hash
  3. **If job exists:** Creates only `user_job` link for the user
  4. **If job is new:** Inserts to `job_pool` AND creates `user_job` link
- **And** deduplication logs show "Pool hit" vs "Pool insert" counts
- **And** embedding is generated for new pool entries only

### AC5: Query Layer Updates
- **Given** the new schema
- **When** dashboard queries jobs for a user
- **Then** queries JOIN `user_job` with `job_pool`
- **And** user-specific data (status, score, notes) comes from `user_job`
- **And** job data (title, company, description) comes from `job_pool`
- **And** query performance remains \< 100ms for 1000 jobs

---

## Tasks / Subtasks

### Task 1: Create job_pool Schema (AC: #1)
- [ ] 1.1: Define `job_pool` table in `src/features/jobs/schema.ts`
  - Copy all job fields from current `jobs` table EXCEPT `user_id`, `status`, `notes`
  - Add `criteria_tags` JSONB column
  - Add `last_verified_at` timestamp
  - Change hash index from per-user to global unique constraint
- [ ] 1.2: Create `jobPool` Drizzle export and types (`JobPool`, `NewJobPool`)
- [ ] 1.3: Write unit tests for schema type inference

### Task 2: Create user_job Schema (AC: #2)
- [ ] 2.1: Define `user_job` table in `src/features/jobs/schema.ts`
  - Include all user-specific fields (status, notes, match_score, gap_analysis)
  - Add foreign keys to `users` and `job_pool` with cascade delete
  - Add unique index on `(user_id, job_pool_id)`
- [ ] 2.2: Create `userJob` Drizzle export and types (`UserJob`, `NewUserJob`)
- [ ] 2.3: Create Drizzle relations between `userJob` ↔ `jobPool` and `userJob` ↔ `users`
- [ ] 2.4: Write unit tests for schema relationships

### Task 3: Generate and Apply Migration (AC: #3)
- [ ] 3.1: Generate Drizzle migration for new tables
- [ ] 3.2: Write migration SQL script in `db/migrations/` that:
  - Creates `job_pool` table
  - Creates `user_job` table
  - Migrates existing data: INSERT INTO job_pool SELECT DISTINCT ON (hash)
  - Creates user_job links for ALL existing user-job relationships
  - Renames `job` to `job_legacy`
- [ ] 3.3: Test migration on development database
- [ ] 3.4: Write rollback script for emergency recovery

### Task 4: Refactor IngestionService (AC: #4)
- [ ] 4.1: Create `JobPoolService` class (`src/features/jobs/pool-service.ts`)
  - `findByHash(hash: string): Promise<JobPool | null>`
  - `insertJob(job: NewJobPool): Promise<JobPool>`
  - `linkToUser(userId: string, poolId: string, initialStatus?): Promise<UserJob>`
- [ ] 4.2: Refactor `IngestionService.persistJobs()` to use JobPoolService
  - Check pool first, insert only if missing
  - Create user links for all jobs (new or existing in pool)
  - Track "pool_hits" vs "pool_inserts" for logging
- [ ] 4.3: Update embedding service to work with `job_pool.id` instead of `jobs.id`
- [ ] 4.4: Write integration tests for deduplication flow

### Task 5: Update Query Layer (AC: #5)
- [ ] 5.1: Create `JobQueryService` class (`src/features/jobs/query-service.ts`)
  - `getUserJobs(userId: string, status?: JobStatus[]): Promise<UserJobWithPool[]>`
  - `getJobDetails(userId: string, poolId: string): Promise<UserJobWithPool | null>`
- [ ] 5.2: Define `UserJobWithPool` type that combines both tables
- [ ] 5.3: Refactor dashboard queries to use new query service
- [ ] 5.4: Update Kanban board components to use new data shape
- [ ] 5.5: Write query performance tests (must be \< 100ms)

### Task 6: Update Server Actions (AC: #4, #5)
- [ ] 6.1: Refactor `discoverJobs` action to use new pool architecture
- [ ] 6.2: Refactor `hydrateJobAction` to update `job_pool` record
- [ ] 6.3: Create `updateJobStatus` action for user_job status changes
- [ ] 6.4: Update matching service to score against user_job (not jobs)
- [ ] 6.5: Write E2E tests for user flows

---

## Dev Notes

### Architecture Requirements (from architecture.md)

- **Standardized Feature Folders:** All code follows `src/features/[feature-name]/` pattern
- **Server Actions:** Return `{ data: T | null, error: string | null }` format
- **ORM:** Drizzle ORM with type-safe queries
- **Validation:** Use Zod for all cross-boundary data transfers

### Project Context Rules (from project-context.md)

- **Atomic Embedding Schema:** Job pool embedding column MUST include comment defining embedded fields
- **Dimension Check:** Vector columns must be `vector(1536)` for Gemini
- **Next.js 15 Actions:** All mutations must use Server Actions
- **Testing:** Vitest for unit tests, Playwright for E2E

### Previous Story Learnings (from 7-1)

- Dev Tools successfully implemented with environment guards
- Apify ingestion flow is working with LinkedIn and Indeed providers
- Current ingestion stores per-user, triggering this optimization need
- The `calculateJobHash()` utility exists in `src/features/ingestion/utils.ts`

### File Structure Changes

```
src/features/jobs/
├── schema.ts          # UPDATE: Add job_pool, user_job tables
├── pool-service.ts    # NEW: JobPoolService class
├── query-service.ts   # NEW: JobQueryService class
├── types.ts           # NEW: UserJobWithPool, PoolStats types
└── index.ts           # UPDATE: Export new services

src/features/ingestion/
├── service.ts         # UPDATE: Use JobPoolService
├── embedding-service.ts  # UPDATE: Target job_pool.id
└── types.ts           # UPDATE: Add PoolIngestionResult

db/migrations/
└── XXXX_shared_job_pool.sql  # NEW: Migration script
```

### Key Implementation Notes

1. **Hash Uniqueness Change:** Current `uniqueIndex` is on `(user_id, hash)`. New `job_pool` has `hash` as globally unique. This is a breaking change requiring data migration.

2. **Embedding Ownership:** Embeddings move from per-user to shared pool. The `updateJobEmbedding` function needs to be updated to target `job_pool.id`.

3. **Status Separation:** `status` field moves from `jobs` to `user_job`. Each user can have different status for the same pool job.

4. **Backward Compatibility:** Dashboard components currently expect `Job` type. Create an adapter or update to `UserJobWithPool` type.

5. **Migration Risk:** 30 existing records need careful migration. The migration script MUST be idempotent (safe to run multiple times).

### Database Indexes Required

```sql
-- job_pool indexes
CREATE UNIQUE INDEX job_pool_hash_idx ON job_pool(hash);
CREATE INDEX job_pool_scraped_at_idx ON job_pool(scraped_at);

-- user_job indexes  
CREATE UNIQUE INDEX user_job_unique_idx ON user_job(user_id, job_pool_id);
CREATE INDEX user_job_user_idx ON user_job(user_id);
CREATE INDEX user_job_status_idx ON user_job(status);
```

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Data-Architecture]
- [Source: _bmad-output/planning-artifacts/epics.md#Story-7.2]
- [Source: src/features/jobs/schema.ts] - Current job schema
- [Source: src/features/ingestion/service.ts] - Current ingestion service
- [Source: src/features/ingestion/utils.ts#calculateJobHash] - Hash utility

---

## Out of Scope

- ❌ Cron/scheduled job infrastructure (Story 7.5)
- ❌ Job criteria management UI (Story 7.3)
- ❌ Multi-user criteria deduplication before Apify calls (Story 7.4)
- ❌ Historical job pool cleanup/archival

---

## Definition of Done

- [ ] `job_pool` and `user_job` tables are created with all required columns
- [ ] Migration successfully moves all existing data without loss
- [ ] Ingestion service deduplicates at pool level
- [ ] Dashboard correctly displays jobs from joined tables
- [ ] Drag-and-drop status updates work with new schema
- [ ] All existing tests pass
- [ ] New tests cover pool service and query service
- [ ] Query performance validated \< 100ms

---

## Estimation

| Aspect | Estimate |
|--------|----------|
| **Complexity** | Medium-High |
| **Time** | 4-6 hours |
| **Risk** | Medium (data migration) |

---

## Dependencies

- ✅ Story 7.1 (Dev Test Button) - DONE
- ✅ Existing ingestion service (Epic 2) - DONE
- ✅ Current job schema infrastructure - DONE

---

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

---

## Change Log

| Date | Change |
|------|--------|
| 2026-01-25 | Story created with comprehensive context |
