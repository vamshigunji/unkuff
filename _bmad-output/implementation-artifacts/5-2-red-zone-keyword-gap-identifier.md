# Story 5.2: "Red Zone" Keyword Gap Identifier

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a candidate,
I want to see specific "Keyword Gaps" where my profile doesn't match a job's high-priority requirements,
So that I can clearly understand what needs to be addressed during tailoring.

## Acceptance Criteria

1. **AC1: Gap Analysis Logic & Schema**
   - **Given** a job and a Master Profile
   - **When** the analysis is triggered
   - **Then** the system identifies specific missing keywords/skills required by the job but absent in the profile
   - **And** for each gap, it identifies the "closest" existing project/experience in the profile (if any) as a bridge candidate
   - **And** the results are persisted in a structured JSON format (e.g., in `job_matches.gap_analysis`).

2. **AC2: "Red Zone" UI Components**
   - **Given** a job card detail view with gap analysis data
   - **When** the "Red Zone" is displayed
   - **Then** missing keywords are listed clearly
   - **And** these zones are highlighted with a "Slow Amber Pulse" effect (Amber Oscillation) to draw attention without anxiety.

3. **AC3: Insight Interaction**
   - **Given** a list of identified gaps
   - **When** a user clicks on a "Red Zone" item
   - **Then** the UI reveals the "Closest Truth Anchor" (Project/Experience) suggested by the AI
   - **And** provides a clear reason why the current profile is insufficient (e.g., "Experience exists but 'React Native' keyword is missing").

4. **AC4: Performance & Integration**
   - **Given** a job card
   - **When** a user expands it or views details
   - **Then** the analysis is loaded (lazy generation if not present)
   - **And** the interface remains responsive during loading (Skeleton/Shimmer)
   - **And** cached analysis is used if available to prevent redundant AI calls.

## Tasks / Subtasks

- [x] Task 1: Schema Updates & Types
  - [x] 1.1: Update `job_matches` table in `src/features/matching/schema.ts` to include `gap_analysis` (jsonb) column.
  - [x] 1.2: Define TypeScript interfaces for `GapAnalysis` result (missing, closest_match, reason).
  - [x] 1.3: Generate and run database migration.

- [x] Task 2: Implement Gap Analysis AI Service
  - [x] 2.1: Create `src/features/matching/gap-service.ts`.
  - [x] 2.2: Implement `generateGapAnalysis(job, profile)` using Vercel AI SDK `generateObject`.
  - [x] 2.3: Define Zod schema for structured output: `z.object({ gaps: z.array(...) })`.
  - [x] 2.4: Design system prompt to strictly compare Job vs. Profile and identify "Red Zones".
  - [x] 2.5: Write unit tests for the service with mocked AI response.

- [x] Task 3: Server Actions & Backend Integration
  - [x] 3.1: Update `src/features/matching/actions.ts` to include `analyzeJobGaps(jobId)`.
  - [x] 3.2: Implement caching logic: check `job_matches.gap_analysis` first; internal generation if null.
  - [x] 3.3: Ensure `job_matches` record exists (create if missing via 5-1 logic) before saving analysis.

- [x] Task 4: Frontend UI Implementation ("Red Zone")
  - [x] 4.1: Create `src/features/matching/components/red-zone-list.tsx`.
  - [x] 4.2: Implement "Amber Oscillation" effect using Tailwind (`animate-pulse` with `shadow-amber-500/50`).
  - [x] 4.3: Create "Gap Item" component with collapsible/interactive details for "Closest Truth Anchor".
  - [x] 4.4: Integrate `RedZoneList` into the Job Detail view (or Job Card expand state).

- [x] Task 5: Integration & Verification
  - [x] 5.1: Verify end-to-end flow: View Job -> Trigger AI -> Persist -> Display Red Zones.
  - [x] 5.2: Verify "Amber Oscillation" visual effect matches UX spec (slow pulse).
  - [x] 5.3: Verify performance (loading states, caching).

- [x] Task 6: Review Follow-ups (AI)
  - [x] 6.1: [AI-Review][Medium] Fix `any` type in `job-card.tsx` state to use `GapSchema`.
  - [x] 6.2: [AI-Review][Medium] Optimize `analyzeJobGaps` in `actions.ts` to use Drizzle Relations for single-query fetch.

## Dev Notes

### Architecture Requirements

**AI & Structured Output:**
- Use `generateObject` from `ai` package with `zod` schema to ensure type-safe JSON output.
- **Model:** Use `google.generative-ai('gemini-1.5-pro-latest')` (or configured provider) for high reasoning capability. 5.1 used `gemini-embedding-001`; 5.2 needs a text/reasoning model. ensuring `GOOGLE_GENERATIVE_AI_API_KEY` is available.
- **Prompting:** Ensure the prompt explicitly asks for "Missing Keywords" (facts present in Job but absent or weak in Profile).

**UX - Amber Oscillation:**
- Reference `_bmad-output/planning-artifacts/ux-design-specification.md`: "Slow amber pulse behind text fields".
- Tailwind v4 Implementation: Use utility classes like `shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-pulse`.
- Color Token: `text-amber-500` or `border-amber-500`.

**Schema Pattern:**
- JSONB columns in Drizzle: `gapAnalysis: jsonb('gap_analysis').$type<GapSchema>()`.

### Project Structure Notes

- **Feature Folder:** Continue working in `src/features/matching/`.
- **Co-location:** `gap-service.ts` next to `scoring-service.ts`.
- **Components:** `red-zone-list.tsx` in `src/features/matching/components/`.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 5.2]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#The "Red Zone" Editor]
- [Source: _bmad-output/implementation-artifacts/5-1-pgvector-suitability-score-engine.md] (Preceding logic)

## Dev Agent Record

### Agent Model Used

Gemini 2.0 Flash

### Debug Log References

- Drizzle migration weirdness with `account` table (drift issue resolved via push)

### Completion Notes List

- Implemented `gap_analysis` column in `job_matches` table
- Implemented `generateGapAnalysis` using Google Gemini
- Implemented `analyzeJobGaps` server action
- Implemented `RedZoneList` UI with Expand state in `JobCard`
- Added comprehensive unit tests for schema, service, actions, and UI component
- Verified Amber Oscillation visual effect

### File List

- src/features/matching/schema.ts
- src/features/matching/gap-service.ts
- src/features/matching/actions.ts
- src/features/matching/components/red-zone-list.tsx
- src/features/dashboard/components/job-card.tsx
- tests/unit/features/matching/gap-schema.test.ts
- tests/unit/features/matching/gap-service.test.ts
- tests/unit/features/matching/actions.test.ts
- tests/unit/features/matching/red-zone-list.test.tsx
