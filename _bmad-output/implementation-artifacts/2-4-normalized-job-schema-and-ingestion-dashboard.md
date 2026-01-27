# Story 2.4: Normalized Job Schema & Ingestion Dashboard

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want a unified database schema and a basic status dashboard for ingestion tasks,
so that I can monitor the health and deduplication of my job pipeline.

## Acceptance Criteria

1. **Schema Finalization**: Ensure the `jobs` table matches the multi-dimensional schema requirements (implemented in 2.1-2.3).
2. **Dashboard UI**: Create a `/dashboard/ingestion` page (or similar) that displays:
    - Summary counts: Total Jobs, Recommended, Hydrated.
    - Provider Status: List of enabled providers and their health.
3. **Job Feed**: Display a list of recently ingested jobs with key metadata (Title, Company, Discovery Source).
4. **Hydration Trigger**: Add a "Deep Dive" button on each job card to trigger the TheirStack hydration (Story 2.3).
5. **Deduplication Audit**: Show a count or indicator of how many jobs were deduplicated in the last run.
6. **Error Visibility**: Display a "System Health" section showing recent ingestion errors/logs.

## Tasks / Subtasks

- [x] Task 1: Create Dashboard UI Components
  - [x] Build `IngestionStats` component (Summary cards).
  - [x] Build `JobFeed` component (List/Table of jobs).
  - [x] Build `ProviderStatus` list.
- [x] Task 2: Implement Data Fetching for Dashboard
  - [x] Create server functions to aggregate stats (counts of jobs by status).
  - [x] Implement pagination or "Load More" for the job feed (via `getRecentJobs`).
- [x] Task 3: In-Dashboard Actions
  - [x] Integrate `hydrateJobAction` into the job list UI.
  - [x] Add a "Refresh/Discover" button to trigger a multi-provider discovery run (via `DiscoveryForm`).
- [x] Task 4: UI/UX Polishing
  - [x] Apply "Premium Design" principles (Subtle micro-animations, glassmorphism containers).
  - [x] Ensure mobile responsiveness.

## Dev Notes

- **Route**: `/dashboard/ingestion`.
- **Theme**: "Liquid Glass" - Deep dark background with semi-transparent, blurred overlays.
- **Micro-interactions**: Hover states on job cards, localized loading spinners on buttons.
- **Health Monitoring**: Real-time status indicators for Jooble, Arbeitnow, and TheirStack.

### Project Structure Notes

- Dashboard Layout: `src/app/(dashboard)/layout.tsx`
- Dashboard Page: `src/app/(dashboard)/dashboard/ingestion/page.tsx`
- Feature Components: `src/features/ingestion/components/`

### References

- [Source: planning-artifacts/epics.md#Story 2.4]

## Dev Agent Record

### Agent Model Used

Amelia (Developer Agent) / Gemini 1.5 Pro

### Debug Log References

- next build (Successful)

### Completion Notes List

- Built a high-fidelity Ingestion Dashboard.
- Unified fragmented ingestion logic into a cohesive monitor-and-control UI.
- Implemented "AI Deep Dive" trigger per job card.
- Enforced session-aware sidebar and layout.

### File List

- src/app/(dashboard)/layout.tsx
- src/app/(dashboard)/dashboard/ingestion/page.tsx
- src/features/ingestion/components/discovery-form.tsx
- src/features/ingestion/components/job-feed.tsx
- src/features/ingestion/components/ingestion-stats.tsx
- src/features/ingestion/queries.ts
- src/lib/utils.ts
