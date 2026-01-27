# Story 1.3: "Truth Anchor" Master Profile Schema

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a candidate,
I want my work history, education, and skills to be stored in a structured "Truth Anchor" table,
so that the AI has a definitive source for all generations.

## Acceptance Criteria

1. [AC-1] Tables for `profiles`, `work_experience`, `education`, and `skills` are available in the local database. [Source: _bmad-output/planning-artifacts/epics.md#Story 1.3]
2. [AC-2] The `profiles` table is linked to the `users` table via `userId` and serves as the root for all career data. [Source: _bmad-output/planning-artifacts/epics.md#Story 1.3]
3. [AC-3] The `profiles` table includes a `bio_embedding` vector column with 1536 dimensions for semantic matching. [Source: _bmad-output/planning-artifacts/project-context.md#🧬 Data & pgvector Precision]
4. [AC-4] Strict foreign key constraints with cascading deletes ensure data integrity across the profile sections. [Source: _bmad-output/planning-artifacts/epics.md#Story 1.3]

## Tasks / Subtasks

- [x] Task 1: Define Profile Feature Schema (AC-1, AC-2, AC-4)
  - [x] Create `src/features/profile/schema.ts`.
  - [x] Define `profiles` table with `id`, `userId` (FK to `users`), `bio`, `summary`, etc.
  - [x] Define `work_experience` table with `id`, `profileId` (FK to `profiles`), `company`, `title`, `startDate`, `endDate`, `description`.
  - [x] Define `education` table with `id`, `profileId` (FK to `profiles`), `institution`, `degree`, `fieldOfStudy`, `startDate`, `endDate`.
  - [x] Define `skills` table with `id`, `profileId` (FK to `profiles`), `name`, `level`, `category`.
- [x] Task 2: Implement pgvector Semantic Column (AC-3)
  - [x] Add `bio_embedding` column to `profiles` using `vector(1536)` (via `pgvector` extension established in Story 1.1).
- [x] Task 3: Centralize and Deploy Schema (AC-1)
  - [x] Export profile schemas in `src/db/schema.ts`.
  - [x] Generate a new migration using `drizzle-kit generate`.
  - [x] Apply the migration using `drizzle-kit push` or `migrate`.
  - [x] Verify table creation and foreign key constraints in the database.

## Dev Notes

- **Standardized Feature Folders:** Co-locate the schema in `src/features/profile/schema.ts`. [Source: architecture.md#Structure Patterns]
- **pgvector Precision:** Dimension for Gemini embeddings must be `vector(1536)`. [Source: project-context.md#🧬 Data & pgvector Precision]
- **Case Sensitivity:** Standardize all PostgreSQL tables and columns to `snake_case`. [Source: 1-1-local-first-postgres-and-drizzle-architecture.md#Change Log]
- **CASCADE Deletes:** Ensure `onDelete: "cascade"` is set for all profile-related foreign keys to support the GDPR "Purge" protocol in Story 1.4.

### Project Structure Notes

- `src/db/schema.ts` is the central aggregate export point.
- Drizzle migrations are stored in `drizzle/`.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.3]
- [Source: _bmad-output/planning-artifacts/architecture.md#Structure Patterns]
- [Source: _bmad-output/planning-artifacts/project-context.md#🧬 Data & pgvector Precision]

## Dev Agent Record

### Agent Model Used

Antigravity v1.0 (Amelia)

### Debug Log References

- [2026-01-24] Initialized Vitest for red-green-refactor cycle.
- [2026-01-24] Created schema in `src/features/profile/schema.ts`.
- [2026-01-24] Centralized schema and pushed to database.
- [2026-01-24] Resolved Code Review Findings:
    - Moved `vector` type to `src/db/utils.ts`.
    - Added indices for all foreign keys.
    - Standardized `updated_at` across all tables.
    - Improved unit test coverage for schema validation.

### Completion Notes List

- Defined `profile`, `work_experience`, `education`, and `skill` tables with singular snake_case naming.
- Implemented `bio_embedding` with `vector(1536)` precision.
- Configured cascading deletes for all profile relations to support GDPR purge requirements.
- Verified schema via Vitest unit tests.
- **Review Follow-up:** Optimized database performance with indices on all foreign key columns.
- **Review Follow-up:** Improved code maintainability by centralizing custom database types.

### Senior Developer Review (AI)

**Outcome:** Approved (After Fixes)
**Date:** 2026-01-24

#### Action Items Resolved
- [x] [MEDIUM] Missing indices on foreign keys (Added to all tables)
- [x] [MEDIUM] Redundant custom type definition (Moved to `src/db/utils.ts`)
- [x] [LOW] Shallow test assertions (Enhanced to validate structure/indices)
- [x] [LOW] Inconsistent UpdatedAt tracking (Standardized across all tables)

### File List

- `unkuff-dev/src/db/utils.ts`
- `unkuff-dev/src/features/profile/schema.ts`
- `unkuff-dev/src/features/profile/schema.test.ts`
- `unkuff-dev/src/db/schema.ts`
- `unkuff-dev/drizzle/0001_panoramic_puff_adder.sql`
- `unkuff-dev/vitest.config.ts`
- `unkuff-dev/tests/setup.ts`
