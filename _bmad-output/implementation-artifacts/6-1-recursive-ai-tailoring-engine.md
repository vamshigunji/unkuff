# Story 6.1: Recursive AI Tailoring Engine

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a candidate,
I want to trigger an iterative AI tailoring process that optimizes my resume for a specific job,
So that I achieve a >95% ATS suitability score.

## Acceptance Criteria

1. **Given** a user triggers "Tailor Resume" for a specific job
2. **When** the LLM executes the prompt chain
3. **Then** the output is strictly limited to facts found in the Master Profile (Truth Anchor)
4. **And** the engine performs up to 3 iterative passes to reach the target >95% match score (FR13)
5. **And** the generated content is formatted according to the specific job's ATS requirements.

## Tasks / Subtasks

- [x] 1. Scaffold Tailoring Feature Infrastructure (AC: 1)
  - [x] 1.1 Create `src/features/tailoring/schema.ts` (if not exists) to define tailoring types and Zod schemas
  - [x] 1.2 Create `src/features/tailoring/actions.ts` skeleton for `generateTailoredResume` server action
  - [x] 1.3 Implement specific types for `ResumeData`, `TailoringResult`, and `SuitabilityMetrics`

- [x] 2. Implement Gemini AI Core Integration (AC: 2)
  - [x] 2.1 Configure Vercel AI SDK `google` provider in `src/lib/gemini.ts` (ensure `experimental: { serverComponentsExternalPackages: ["@google/generative-ai"] }` in `next.config.ts`)
  - [x] 2.2 Create `src/features/tailoring/service.ts` for core AI logic separation from actions
  - [x] 2.3 Implement the prompt construction logic that combines `Master Profile` + `Job Description` + `ATS Constraints`

- [x] 3. Implement Recursive Optimization Loop (AC: 4)
  - [x] 3.1 Implement the `evaluateSuitability` function (internal scoring) to check against >95% threshold
  - [x] 3.2 Implement the `refinementLoop` logic: Generate -> Score -> if < 95% -> Refine (Max 3 passes)
  - [x] 3.3 Ensure the loop preserves the best version if max passes reached without 95%

- [x] 4. Implement Hallucination Guardrails & Grounding (AC: 3)
  - [x] 4.1 Inject strict system instructions: "You must ONLY use facts from the provided Master Profile. Do not invent skills."
  - [x] 4.2 Implement a post-generation verification step that checks extracted entities against `Master Profile` data
  - [x] 4.3 Fail the generation (or retry) if hallucination is detected

- [x] 5. Connect to Server Action & Frontend Trigger (AC: 1, 5)
  - [x] 5.1 Finalize `generateTailoredResume` action to accept `jobId`
  - [x] 5.2 Fetch Job and Profile data from DB within the action
  - [x] 5.3 Return the final structured resume content (JSON/Markdown) suitable for PDF/DOCX generation
  - [x] 5.4 Ensure error handling manages API timeouts or iteration failures gracefully

## Dev Notes

### Architecture Patterns & Constraints
- **Module Location:** `src/features/tailoring/`
- **AI Provider:** Google Gemini 1.5 Pro via Vercel AI SDK (`@ai-sdk/google`)
- **Strict Separation:** Keep the prompt engineering logic in `service.ts`, expose only high-level `generateTailoredResume` in `actions.ts`.
- **Latency Management:** This process can take up to 45s. Ensure the action supports streaming feedback (covered in Story 6.2, but prepare the structure for it).
- **Data Sovereignty:** Send ONLY anonymized/necessary data to Gemini. Use `sanitizeForAi` utility if available.

### Technical Specifications
- **Model:** `gemini-1.5-pro-latest`
- **Max Tokens:** Allocate sufficient tokens for full resume generation (e.g., 4096 output).
- **Temperature:** Low (0.2 - 0.3) for factual consistency; slightly higher (0.7) for rewriting/optimizing *style* only, but keep facts pinned.
- **Retry Logic:** Use Vercel AI SDK `maxRetries` or manual loop for the 3-pass optimization.

### Project Structure Notes
- Adheres to `Standardized Feature Folders` pattern.
- Dependencies: `ai`, `@ai-sdk/google`, `drizzle-orm`.

### References
- [Epic 6: Automated ATS Tailoring & Export Pilot](_bmad-output/planning-artifacts/epics.md#epic-6-automated-ats-tailoring--export-pilot)
- [Project Context: AI Rules](_bmad-output/planning-artifacts/project-context.md#critical-implementation-rules)

## Dev Agent Record

### Agent Model Used

Antigravity (Google DeepMind)

### Debug Log References

### Completion Notes List
- Implemented core tailoring loop with Gemini 1.5 Pro
- Added and integrated strict hallucination guardrails (Skills & Companies)
- Updated data mapping to safely handle DB <-> Service layer types
- Verified via unit tests (service, actions, guardrails, optimization loop)

### File List
- src/features/tailoring/schema.ts
- src/features/tailoring/actions.ts
- src/features/tailoring/service.ts
- src/features/tailoring/guardrails.ts
- tests/unit/features/tailoring/actions.test.ts
- tests/unit/features/tailoring/service.test.ts
- tests/unit/features/tailoring/optimization.test.ts
- tests/unit/features/tailoring/guardrails.test.ts
