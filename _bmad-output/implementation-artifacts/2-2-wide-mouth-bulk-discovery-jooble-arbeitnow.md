# Story 2.2: "Wide Mouth" Bulk Discovery (Jooble/Arbeitnow)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a candidate,
I want to see a broad feed of potentially relevant jobs from free aggregators,
so that I have a high-volume discovery stream without spending API credits.

## Acceptance Criteria

1. **Jooble Integration**: Implement a provider for Jooble using their free API.
2. **Arbeitnow Integration**: Implement a provider for Arbeitnow (no auth required).
3. **Bulk Ingestion**: Successfully fetch and normalize at least 20+ jobs per keyword search.
4. **Data Fidelity**: Populate `jobs` table with title, company, location, salary (if available), source URL, and description/snippet.
5. **Performance**: Aggregator search and ingestion must complete in < 2 seconds for 95th percentile requests (NFR1).
6. **Deduplication**: Ensure no duplicate jobs are inserted based on the `hash` (Title+Company).
7. **Mapping Accuracy**: Map the varied schemas of Jooble and Arbeitnow to the multi-dimensional `jobs` schema defined in Story 2.1.

## Tasks / Subtasks

- [x] Task 1: Implement Jooble Provider
  - [x] Add `JOOBLE_API_KEY` to `.env.local`.
  - [x] Create `src/features/ingestion/providers/jooble.ts` extending `BaseAggregator`.
  - [x] Implement normalization for Jooble job objects.
- [x] Task 2: Implement Arbeitnow Provider
  - [x] Create `src/features/ingestion/providers/arbeitnow.ts` extending `BaseAggregator`.
  - [x] Implement normalization for Arbeitnow job objects.
- [x] Task 3: Integrate into Ingestion Service
  - [x] Register new providers in the `IngestionService` (via `provider-registry.ts`).
  - [x] Verify discovery loop works with mocking/unit tests.
- [x] Task 4: UI Hook (Optional but recommended for testing)
  - [x] Create a `discoverJobs` server action in `src/features/ingestion/actions.ts`.
- [x] Task 5: Performance & Error Handling
  - [x] Added timeout logic and error boundaries to providers.
  - [x] Verified graceful degradation in orchestrator.

## Dev Notes

- **Jooble**: Successfully implemented POST-based discovery.
- **Arbeitnow**: Successfully implemented GET-based discovery with local keyword filtering for precision.
- **Action**: Created `discoverJobs` which handles multi-provider execution and session-based authorization.
- **Normalization**: Ensured all fields (title, company, location, snippet, URL) Are correctly mapped to the multi-dimensional `jobs` schema.

### Project Structure Notes

- Providers in `src/features/ingestion/providers/`.
- Orchestration in `src/features/ingestion/service.ts`.
- Registry in `src/features/ingestion/provider-registry.ts`.

### References

- [Source: planning-artifacts/epics.md#Story 2.2]

## Dev Agent Record

### Agent Model Used

Amelia (Developer Agent) / Gemini 1.5 Pro

### Debug Log References

- tests/providers.test.ts

### Completion Notes List

- Implemented Jooble and Arbeitnow providers with full normalization.
- Created `discoverJobs` server action for multi-source ingestion.
- Verified REST API request patterns and error handling via Vitest.
- Enhanced `BaseAggregator` to support both GET and POST patterns.

### File List

- src/features/ingestion/providers/jooble.ts
- src/features/ingestion/providers/arbeitnow.ts
- src/features/ingestion/provider-registry.ts
- src/features/ingestion/actions.ts
- tests/providers.test.ts
