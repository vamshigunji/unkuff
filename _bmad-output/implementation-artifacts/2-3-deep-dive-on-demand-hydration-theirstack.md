# Story 2.3: "Deep Dive" On-Demand Hydration (TheirStack)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a candidate,
I want to fetch the full description and tech stack for a specific job card when I click it,
so that I have the "Truth Anchor" context for a >95% match without wasting credits on irrelevant jobs.

## Acceptance Criteria

1. **TheirStack Integration**: Implement a provider for TheirStack using their Jobs API.
2. **On-Demand Hydration**: Create a mechanism to trigger hydration for a single job record.
3. **Credit Management**: Ensure hydration logic only runs once per job (check if `description` or `technographics` already exist).
4. **Data Extraction**: Successfully retrieve and store the `description`, `technographics` (JSONB), and `company_website` from TheirStack.
5. **Database Update**: Correctly update the existing job record in the local database with the new information.
6. **Graceful Handling**: Handle TheirStack API limits (429) or failures gracefully without affecting the UI state.

## Tasks / Subtasks

- [x] Task 1: Implement TheirStack Provider
  - [x] Add `THEIRSTACK_API_KEY` to `.env.local`.
  - [x] Create `src/features/ingestion/providers/theirstack.ts`.
  - [x] Implement `fetchJobDetails(sourceId: string)` method (as `hydrate`).
- [x] Task 2: Implement Hydration Logic in Service
  - [x] Add `hydrateJob(jobId: string)` method to `src/features/ingestion/service.ts`.
  - [x] Implement check for existing data to prevent redundant API calls.
- [x] Task 3: Create Hydration Server Action
  - [x] Add `hydrateJobAction(jobId: string)` to `src/features/ingestion/actions.ts`.
- [x] Task 4: Testing & Verification
  - [x] Write Vitest tests for `theirstack.ts` mocking the API response.
  - [x] Verify that the database update correctly merges new data.
- [x] Task 5: Credits & Limit Guardrails
  - [x] Implemented a "single-fetch" guardrail to check if data exists before calling the API.

## Dev Notes

- **Implementation Pattern**: Hybrid On-Demand Hydration.
- **Data Fidelity**: Extracts full descriptions and `technographics` arrays.
- **Credit Saver**: The system now checks if `description` or `technographics` are already populated before spending TheirStack credits.
- **Action**: The `hydrateJobAction` allows the UI to trigger a deep dive for any discoverable job.

### Project Structure Notes

- New Provider: `src/features/ingestion/providers/theirstack.ts`.
- Orchestration: `src/features/ingestion/service.ts` (`hydrateJob`).

### References

- [Source: planning-artifacts/epics.md#Story 2.3]

## Dev Agent Record

### Agent Model Used

Amelia (Developer Agent) / Gemini 1.5 Pro

### Debug Log References

- tests/theirstack-hydration.test.ts

### Completion Notes List

- Implemented TheirStack deep-dive hydration with technographics support.
- Integrated "single-fetch" guardrail to preserve API credits.
- Created `hydrateJobAction` server action for UI integration.
- Verified database atomic updates for hydration fields.

### File List

- src/features/ingestion/providers/theirstack.ts
- src/features/ingestion/service.ts
- src/features/ingestion/actions.ts
- src/features/ingestion/provider-registry.ts
- tests/theirstack-hydration.test.ts
