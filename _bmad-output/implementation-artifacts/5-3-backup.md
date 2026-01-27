# Story 5.3: Automated Match-Scan (Scheduled/Triggered)

Status: in-progress

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a candidate,
I want my recommendations to update automatically when new jobs are ingested or my profile changes,
So that my dashboard always reflects the freshest data without manual refreshing.

## Acceptance Criteria

1. **AC1: Profile Update Trigger**
   - **Given** a user updates and saves their "Master Profile" (Skills, Experience, etc.)
   - **When** the save operation completes
   - **Then** the system triggers a background re-scoring process for all active job cards in the "Recommended" column
   - **And** the UI reflects the updated scores (if changed) upon the next refresh or via real-time update.

2. **AC2: Ingestion Trigger**
   - **Given** new jobs are ingested via the Aggregator/Scraper engine
   - **When** the ingestion batch completes
   - **Then** the scoring engine automatically calculates suitability scores for all new jobs against the user's profile
   - **And** only jobs with a score > 70 are added to the "Recommended" column (or flagged as new).

3. **AC3: Scheduled Maintenance**
   - **Given** the system is running
   - **When** a scheduled interval occurs (e.g., daily)
   - **Then** a maintenance job runs to maximize "freshness" (e.g., archiving old jobs, re-verifying high-match scores).
   - *(Note: Since this is a local-first app, this implies checking for updates when the app starts or is active).*

4. **AC4: Performance & Feedback**
   - **Given** a background scan is running
   - **When** the user views the dashboard
   - **Then** the UI remains responsive (non-blocking)
   - **And** a subtle indicator (e.g., "Updating matches...") is visible if the operation is long-running.

## Tasks / Subtasks

- [x] Task 1: Event-Based Trigger System
  - [x] 1.1: Design an `EventEmitter` or similar mechanism in `src/lib/events.ts` to decouple detailed logic.
  - [x] 1.2: Update `profile/actions.ts` to emit `PROFILE_UPDATED` event after successful save.
  - [x] 1.3: Update `ingestion/actions.ts` (or service) to emit `JOBS_INGESTED` event.

- [x] Task 2: Background Match Service
  - [x] 2.1: Create `src/features/matching/match-service.ts` (if not exists) or extend `scoring-service.ts`.
  - [x] 2.2: Implement `processProfileUpdate(userId)`: Fetch all recommended jobs -> Re-calculate scores -> Batch update DB.
  - [x] 2.3: Implement `processNewJobs(jobIds)`: Fetch profile -> Batch calculate scores -> Insert matches.

- [x] Task 3: Integration & Optimization
  - [x] 3.1: Wire up the Event Listeners (e.g., in a top-level component or instrumentation hook if possible in Next.js, or direct calls in Server Actions) to trigger the Match Service.
  - [x] 3.2: *Critical:* Since Vercel/Next.js "Serverless" limits background tasks, ensure we use `waitUntil` (if available/supported) or simply await the process in a non-blocking way for the UI if possible, or accept that "local-first" means processing happens during active requests.
  - [x] 3.3: Optimize queries: Use proper indexing (added in Story 1.1/5.1) for fast lookups.

- [x] Task 4: UI Feedback
  - [x] 4.1: Add a "Last Updated" or "Syncing" indicator to the Dashboard Sidebar.
  - [x] 4.2: Verify that dragging/dropping cards works while background scoring update happens (Optimistic UI).

## Dev Notes

### Architecture Requirements

**Event Mechanism in Next.js:**
- In a "Local-First" / "Serverful" (Docker/Node) setup, we can use standard Node `EventEmitter`.
- If deploying to Vercel (Serverless), we can't rely on long-running background listeners.
- **Decision:** As per Architecture (Local-First), we can shim a simple Event Bus or just use direct service calls in Server Actions (`await batchScore(...)` after save).
- **Recommendation:** Use direct function calls inside `profile/actions.ts` but wrapped in `queueMicrotask` or similar to avoid blocking the HTTP response if possible, OR just await it to ensure consistency (NFR8: Persistence < 500ms might be tight if re-scoring 100 jobs).
- *Refined Strategy:* For "Profile Save", trigger re-scoring asynchronously. In Next.js Server Actions, we can kick off the promise and not await it *if* the runtime allows (it might kill it). Better safety: Await it, but optimize the batch size.

**Scoring Optimization:**
- Re-use `batchScoring` from Story 5.1.
- Ensure `pgvector` index is used for resemblance checks to avoid 0-100 full table scans if we have thousands of jobs.

### Project Structure Notes

- **Feature Folder:** `src/features/matching/`
- **Events:** `src/lib/events.ts` (lightweight typed event emitter)

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 5.3]
- [Source: _bmad-output/planning-artifacts/architecture.md#Wait-State Management]

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash

### Debug Log References

### Completion Notes List

### File List
