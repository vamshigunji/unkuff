# Story 2.1: Multi-Provider Ingestion Workspace

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want a modular "Provider" architecture for different aggregators (Jooble, TheirStack),
so that I can easily add or swap ingestion sources as unkuff scales.

## Acceptance Criteria

1. **BaseProvider Interface**: Implement a robust TypeScript abstract class or interface in `src/features/ingestion/` that enforces `fetch()` and `normalize()` methods.
2. **Normalized Job Schema**: All providers must return data matching the standardized `NormalizedJob` type, aligned with the Drizzle schema.
3. **Provider Registry**: Create a mechanism to register and execute multiple providers (Jooble, TheirStack, Apify Actors) through a single ingestion service.
4. **Dynamic Authentication**: Providers must support dynamic configuration of API keys and endpoints via environment variables.
5. **Deduplication Hook**: Ingestion logic must include a pre-insertion hook to deduplicate jobs based on a Title+Company hash.
6. **Feature Folder Integrity**: All logic, types, and schemas for ingestion must reside in `src/features/ingestion/`.

## Tasks / Subtasks

- [x] Task 1: Initialize Ingestion Feature Structure
  - [x] Create `src/features/ingestion/types.ts` for standardized job and provider types.
  - [x] Create `src/features/ingestion/base-provider.ts` with the `BaseProvider` abstract class.
- [x] Task 2: Implement "Jobs" Schema
  - [x] Define `jobs` table in `src/features/jobs/schema.ts` (Consolidated).
  - [x] Export schema from `src/db/schema.ts`.
- [x] Task 3: Develop Ingestion Service Orchestrator
  - [x] Implement `src/features/ingestion/service.ts` to manage the lifecycle of an ingestion run.
  - [x] Implement `calculateJobHash(title, company)` utility for deduplication.
- [x] Task 4: Create Initial Providers
  - [x] Implement `src/features/ingestion/providers/base-aggregator.ts` for REST-based sources.
  - [x] Implement a `MockProvider` for testing the loop.
- [x] Task 5: Testing & Guardrails
  - [x] Write Vitest unit tests for the Ingestion Service.
  - [x] Verify that provider failures are handled gracefully (NFR7).

## Dev Notes

- **Implementation Pattern**: Standardized Feature Folders.
- **Deduplication**: MD5 hash of normalized title and company.
- **Schema Management**: Consolidated the `jobs` table into the `jobs` feature to support both ingestion and future matching.
- **Resilience**: Orchestrator uses `Promise.allSettled` to ensure one provider failure doesn't block others.

### Project Structure Notes

- Feature Folder: `src/features/ingestion/`
- Central Schema: `src/features/jobs/schema.ts` (owned by Jobs feature but populated by Ingestion).

### References

- [Source: planning-artifacts/epics.md#Story 2.1]

## Dev Agent Record

### Agent Model Used

Amelia (Developer Agent) / Gemini 1.5 Pro

### Debug Log References

- ingestion-service.test.ts

### Completion Notes List

- Established pluggable `BaseProvider` architecture.
- Implemented `IngestionService` with optimized batched upserts.
- Created robust `jobs` schema with multi-dimensional tracking (Salary, WorkMode).
- Verified normalization loop with `MockProvider`.

### File List

- src/features/ingestion/types.ts
- src/features/ingestion/base-provider.ts
- src/features/ingestion/utils.ts
- src/features/ingestion/service.ts
- src/features/ingestion/providers/base-aggregator.ts
- src/features/ingestion/providers/mock-provider.ts
- src/features/jobs/schema.ts
- tests/ingestion-service.test.ts
