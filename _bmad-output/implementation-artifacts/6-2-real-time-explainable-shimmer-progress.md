# Story 6.2: Real-time "Explainable Shimmer" Progress

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a candidate,
I want to see granular progress updates (e.g., "Mapping skills...", "Refining content...") during the 45s tailoring wait,
so that I stay informed and trust the background work.

## Acceptance Criteria

1. **Given** an active tailoring process
2. **When** the backend emits status events (thinking, mapping, refining, grounding)
3. **Then** the UI displays an "Explainable Shimmer" with the current status message
4. **And** the total processing time remains < 45 seconds (NFR3).
5. **And** the UI uses the "Liquid Glass" aesthetic (30px backdrop blur) with a slow amber pulse for "Thinking" states.
6. **And** the shimmer component displays distinct messages for each stage: "Thinking...", "Mapping skills...", "Refining content...", "Grounding facts...".

## Tasks / Subtasks

- [x] Task 1: Implement Server-Side Explainable Streaming Logic
  - [x] Update `src/features/tailoring/actions.ts` (tailorResume) to use `streamText` or `streamObject` from Vercel AI SDK.
  - [x] Implement a mechanism to inject/yield status tokens ("thinking", "mapping", "refining", "grounding") into the stream.
  - [x] Ensure the stream returns the final structured resume data alongside the status updates.
- [x] Task 2: Create "Explainable Shimmer" UI Component
  - [x] Create `src/features/tailoring/components/explainable-shimmer.tsx`.
  - [x] Implement the "Liquid Glass" container (30px blur, 1px refraction stroke) using `bg-glass-md` token.
  - [x] Add the "Shimmer" animation (max 3 active states per view) using `framer-motion` or CSS animations.
  - [x] Implement the dynamic text label that updates based on stream status events.
  - [x] Add "Amber Oscillation" pulse for the thinking state.
- [x] Task 3: Integrate Streaming State with Tailor Trigger
  - [x] Update the `ResumeTailoring` or equivalent trigger component in `src/features/tailoring/` or `src/features/resume/`.
  - [x] Connect the UI to the streaming action using `useStreamableValue` (AI SDK) or `useActionState`.
  - [x] Display `ExplainableShimmer` overlay when `isLoading` or `isStreaming` is true.
  - [x] Handle the completion state (Emerald flash/Transition to 100%).

## Dev Notes

### Architecture & Patterns
- **AI Streaming:** Use Vercel AI SDK `streamText` / `streamObject` with the Google Gemini provider.
- **Status Protocol:** Define a strictly typed protocol for status messages to separate "content" from "status" in the SSE stream. The `experimental_streamData` property on `streamText` is the preferred way if using AI SDK v3.1+, or manual chunking.
- **Glass UI:** Use `bg-glass-sm` or `bg-glass-md` tokens. Do NOT use raw CSS filters.
- **Performance:** Ensure the shimmer animation uses CSS `transform` or `opacity` to maintain 60fps.

### Project Structure Notes
- **Feature Folder:** `src/features/tailoring/`
- **Actions:** `src/features/tailoring/actions.ts`
- **Components:** `src/features/tailoring/components/`

### References
- [Architecture: AI Stream Handling](_bmad-output/planning-artifacts/architecture.md#implementation-patterns--consistency-rules)
- [UX: Explainable Shimmer](_bmad-output/planning-artifacts/ux-design-specification.md#the-explainable-shimmer)

## Dev Agent Record

### Agent Model Used
dev (Amelia)

### File List
- `src/features/tailoring/components/explainable-shimmer.tsx` - Main shimmer UI component
- `src/features/tailoring/components/tailor-trigger.tsx` - Trigger button with overlay integration
- `src/features/tailoring/hooks/use-tailoring-stream.ts` - SSE stream consumer hook
- `src/features/tailoring/service.ts` - AI generation with onStatus callback
- `src/app/api/tailoring/stream/route.ts` - SSE API endpoint
- `tests/explainable-shimmer.test.tsx` - Unit tests for shimmer component

### Completion Notes List
- ✅ Implemented real-time SSE streaming via `/api/tailoring/stream` using `ReadableStream`.
- ✅ Integrated `generateOptimizedResume` with `onStatus` callback to emit `thinking`, `mapping`, `refining`, `grounding` tokens.
- ✅ Created `ExplainableShimmer` component with "Liquid Glass" effect and status-specific animations (slow amber pulse for thinking, emerald flash for complete).
- ✅ Updated `TailorTrigger` to connect frontend to the streaming API and display progress overlay.
- ✅ Verified implementation with Vitest unit tests for the shimmer component and callback logic.
- ✅ Adhered to NFR3 with a 45s timeout gate in the API route.
- ✅ Fixed missing export in `src/db/schema.ts` for the `generatedResumes` table.

### Code Review Fixes (2026-01-25)
- ✅ **AC6 Fix:** Added "refining" status with "Refining content..." message to match all 4 required stages
- ✅ **Service Fix:** Service now emits "refining" during optimization retry loop
- ✅ **Type Safety:** Replaced `any` types with proper `TailoringResult` interface
- ✅ **Error Recovery:** Added retry/dismiss UI for error states in TailorTrigger
- ✅ **Cleanup:** Removed unused `streamText`, `google`, `z` imports from API route
- ✅ **Tests:** Extended test coverage to all 7 shimmer states including custom messages

