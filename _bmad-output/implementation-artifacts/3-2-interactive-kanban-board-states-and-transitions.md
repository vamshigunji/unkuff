# Story 3.2: Interactive Kanban Board (States & Transitions)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a candidate,
I want a multi-column Kanban board representing my pipeline (Recommended, Applied, Interviewing, Offer),
so that I can visually track my application progress.

## Acceptance Criteria

1.  **Pipeline Columns**: The board displays four distinct columns: "Recommended", "Applied", "Interviewing", and "Offer".
2.  **State Filtering**: Job cards are correctly filtered into their respective columns based on the `status` field from the database.
3.  **High-Density Layout**: The board utilizes a refined, high-density layout suitable for desktop-first usage, adhering to "Liquid Glass" design principles (padding, spacing, transparency).
4.  **Responsive Adaptation**: On smaller screens (mobile), columns stack or become a swipeable view (as per modern dashboard standards), maintaining legibility.
5.  **Data Hydration**: The board initially loads data via Server Actions for immediate "Truth Anchor" consistency (no client-side hydration flicker).

## Tasks / Subtasks

- [x] Task 1: Initialize Dashboard Feature & Types (AC: 1, 3)
  - [x] Create `src/features/dashboard/types.ts` defining `KanbanColumn`, `KanbanState` and importing `Job` type.
  - [x] Define the 4 static columns: Recommended, Applied, Interviewing, Offer.
  - [x] Create `src/features/dashboard/components/` directory.

- [x] Task 2: Implement Server-Side Data Fetching (AC: 2, 5)
  - [x] Create `src/features/dashboard/actions.ts`.
  - [x] Implement `getKanbanBoardData()` which retrieves jobs from `db` and groups/filters them by status.
  - [x] Ensure database query is optimized (e.g., using indexes on `status`).
  - [x] Create unit test for `getKanbanBoardData` to verify correct grouping.

- [x] Task 3: Create Basic Job Card & Column Components (AC: 1, 3)
  - [x] Create `src/features/dashboard/components/kanban-column.tsx` (Server/Client component wrapper).
  - [x] Create `src/features/dashboard/components/job-card-skeleton.tsx` (Basic card display for enabling the board layout; Story 3.3 calls for high-fidelity).
  - [x] Implement "Liquid Glass" styling for column containers (using `bg-glass-sm` tokens).

- [x] Task 4: Assemble Kanban Board & Page Integration (AC: 3, 4, 5)
  - [x] Create `src/features/dashboard/components/kanban-board.tsx` (Client Component for future interaction).
  - [x] Integrate columns and fetch data (or pass data from page).
  - [x] Update `src/app/(dashboard)/page.tsx` to fetch data via `getKanbanBoardData` and render `<KanbanBoard initialData={...} />`.
  - [x] Verify responsive stacking behavior for Mobile/Tablet.

## Dev Notes

- **Architecture**:
  - `src/features/dashboard/` is the domain home.
  - **Data Fetching**: Prefer Server Components fetching data and passing to Client Components as props (`initialData`).
  - **Styles**: Use the tokens from Story 3.1 (`bg-glass-sm`, etc.).
  - **Responsive**: Desktop = 4 columns side-by-side. Mobile = Stacked or Tabbed (simplified stack is acceptable for now).
- **Zustand**: While 3.4 handles Drag-and-Drop, 3.2 might initialize the Zustand store with the fetched data to prepare for it. Consider creating `src/features/dashboard/store.ts`.

### Project Structure Notes

- New Module: `src/features/dashboard/`
- Integration: `src/app/(dashboard)/page.tsx`

### References

- [Source: planning-artifacts/epics.md#Story 3.2]
- [Source: implementation-artifacts/3-1-dashboard-layout-and-command-sidebar-liquid-glass.md] (For styling tokens)
- [Source: planning-artifacts/architecture.md#Project Structure]

## Dev Agent Record

### Agent Model Used

Amelia (Dev Agent) / Gemini 1.5 Pro

### Debug Log References

- Fixed lint errors in `job-card` regarding `any` type for metadata.
- Note: Existing tests `tests/ingestion-service.test.ts` and `tests/dashboard-layout.test.tsx` were failing prior to this story implementation.
- `dashboard-actions.test.ts` passed successfully.

### Completion Notes List

- Implemented `KanbanBoard` with horizontal scrolling layout.
- Implemented `getKanbanBoardData` server action with data serialization to support Client Components.
- Created `JobCard` and `KanbanColumn` components using Liquid Glass tokens (`bg-glass-sm`).
- Updated `types.ts` to include `SerializedJob` type.
- Updated `/dashboard` page to fetch and render the board.
- **Review Fixes**: 
  - Optimized DB query to filter only valid Kanban statuses using `inArray`.
  - Added accessibility features to `JobCard` (`tabIndex`, `role`, `focus-visible`).
  - Added `tests/dashboard-config.test.ts` to verify column configuration.
  - Exported `Job` type from `types.ts` to fix lint error.

### File List

- src/features/dashboard/actions.ts
- src/features/dashboard/components/job-card.tsx
- src/features/dashboard/components/kanban-board.tsx
- src/features/dashboard/components/kanban-column.tsx
- src/features/dashboard/types.ts
- src/app/(dashboard)/dashboard/page.tsx
- tests/dashboard-actions.test.ts
