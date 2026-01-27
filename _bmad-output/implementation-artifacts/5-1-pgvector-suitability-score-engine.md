# Story 5.1: pgvector Suitability Score Engine

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a system,
I want to calculate a numerical "Suitability Score" for every job card relative to the Master Profile,
So that I can help users prioritize high-probability matches.

## Acceptance Criteria

1. **AC1: Embedding Generation Infrastructure**
   - **Given** a new or updated Master Profile (bio, summary, work experience, skills)
   - **When** the profile is saved
   - **Then** an embedding is generated using Gemini's `gemini-embedding-001` model via Vercel AI SDK
   - **And** the embedding (1536 dimensions) is stored in the `profiles.bio_embedding` column
   - **And** embedding generation completes in < 2 seconds

2. **AC2: Job Embedding Generation**
   - **Given** a job posting is ingested (description, title, skills, technographics)
   - **When** the job is saved or hydrated with full description
   - **Then** an embedding is generated from the job content
   - **And** the embedding is stored in the `jobs.embedding` column
   - **And** only jobs with non-null descriptions receive embeddings (lazy generation)

3. **AC3: Suitability Score Calculation**
   - **Given** a job with an embedding and a profile with a bio_embedding
   - **When** the scoring engine is triggered
   - **Then** a cosine similarity calculation is performed using pgvector's `<=>` operator
   - **And** raw similarity (0–1) is converted to a numerical score (0–100)
   - **And** the score is saved to the database with timestamp

4. **AC4: Score Display on Job Cards**
   - **Given** a job card with a calculated suitability score
   - **When** the card is rendered on the Kanban board
   - **Then** the score is displayed prominently (e.g., "87%")
   - **And** scores ≥90% use emerald green color (high match indicator)
   - **And** scores 70–89% use blue color (good match)
   - **And** scores <70% use neutral/gray color (low match)

5. **AC5: Batch Scoring for New Profile**
   - **Given** a user completes or updates their Master Profile
   - **When** the profile embedding is generated
   - **Then** the system triggers background rescoring of all active jobs in "Recommended" status
   - **And** the UI reflects updated scores within 5 seconds (or on next refresh)

6. **AC6: Performance Requirements**
   - **Given** scoring operations
   - **When** calculating individual job scores
   - **Then** single score calculation completes in < 100ms
   - **And** batch scoring of 100 jobs completes in < 5 seconds
   - **And** embedding generation respects Gemini API rate limits

## Tasks / Subtasks

- [x] Task 1: Install Dependencies & Setup Gemini Embedding Client (AC: 1, 2)
  - [x] 1.1: Install Vercel AI SDK packages: `npm install ai @ai-sdk/google`
  - [x] 1.2: Create `src/lib/gemini.ts` - initialize Google AI provider with API key
  - [x] 1.3: Create `src/lib/embeddings.ts` - embedding utility functions using `embed()` from Vercel AI SDK
  - [x] 1.4: Configure environment variables in `.env.local` (GOOGLE_GENERATIVE_AI_API_KEY)
  - [x] 1.5: Write unit tests for embedding generation with mock provider

- [x] Task 2: Create Matching Feature Structure (AC: 3)
  - [x] 2.1: Create `src/features/matching/` folder with standard structure
  - [x] 2.2: Create `src/features/matching/schema.ts` - define `job_matches` table if needed (userId, jobId, score, calculatedAt)
  - [x] 2.3: Create `src/features/matching/actions.ts` - Server Actions for scoring operations
  - [x] 2.4: Update `src/db/schema.ts` to export matching schema
  - [x] 2.5: Create migration for any new tables

- [x] Task 3: Implement Profile Embedding Pipeline (AC: 1)
  - [x] 3.1: Update `src/features/profile/actions.ts` - implement `updateBioEmbedding()` function (currently stub)
  - [x] 3.2: Create profile text aggregation function (combine bio, summary, skills, experience titles/descriptions)
  - [x] 3.3: Integrate embedding generation with profile save actions (non-blocking, background)
  - [x] 3.4: Add error handling for API failures with retry logic
  - [x] 3.5: Write tests for profile embedding pipeline

- [x] Task 4: Implement Job Embedding Pipeline (AC: 2)
  - [x] 4.1: Create `src/features/ingestion/embedding-service.ts` - job embedding logic
  - [x] 4.2: Create job text aggregation function (title, description, skills, qualifications)
  - [x] 4.3: Update ingestion service to generate embeddings on job hydration
  - [x] 4.4: Implement lazy embedding (only generate for jobs with full descriptions)
  - [x] 4.5: Write tests for job embedding pipeline

- [x] Task 5: Implement pgvector Cosine Similarity Scoring (AC: 3, 6)
  - [x] 5.1: Create `src/features/matching/scoring-service.ts` - core scoring logic
  - [x] 5.2: Implement cosine similarity query using raw SQL with pgvector `<=>` operator
  - [x] 5.3: Create score normalization function (raw similarity → 0–100 score)
  - [x] 5.4: Implement `calculateJobScore(userId, jobId)` action
  - [x] 5.5: Implement `calculateAllJobScores(userId)` batch action with concurrency control
  - [x] 5.6: Write performance tests to verify < 100ms single score, < 5s batch

- [x] Task 6: Update Job Card UI with Score Display (AC: 4)
  - [x] 6.1: Update `src/features/dashboard/components/job-card.tsx` to display score
  - [x] 6.2: Create `SuitabilityBadge` component with color coding logic
  - [x] 6.3: Add score to Kanban board card rendering
  - [x] 6.4: Implement conditional color styling (emerald ≥90%, blue 70–89%, gray <70%)
  - [x] 6.5: Write component tests for score display

- [x] Task 7: Implement Background Re-scoring Trigger (AC: 5)
  - [x] 7.1: Create trigger logic in profile save action to queue rescoring
  - [x] 7.2: Implement batch rescoring with proper error handling
  - [x] 7.3: Add optimistic UI update for score changes (or invalidation pattern)
  - [x] 7.4: Test rescoring flow end-to-end


- [x] Task 8: Integration Testing & Validation (AC: 1-6)
  - [x] 8.1: Write integration test for full flow (profile → embedding → job score)
  - [x] 8.2: Verify score persistence and retrieval
  - [x] 8.3: Test edge cases (missing embeddings, API failures)
  - [x] 8.4: Verify NFR1 compliance (< 2 second display latency)

## Dev Notes

### Architecture Requirements

**Feature Folder Pattern (from architecture.md):**
- All code MUST follow the Standardized Feature Folders pattern
- Create `src/features/matching/` with:
  - `components/` - UI components for score display
  - `actions.ts` - Server Actions for scoring operations
  - `schema.ts` - Drizzle schema for job_matches (if needed)
  - `scoring-service.ts` - Core scoring business logic

**Server Actions Pattern (from project-context.md):**
- All mutations MUST use Server Actions returning `{ data: T | null, error: string | null }`
- Use `"use server"` directive at top of actions file
- Authentication required via `auth()` from `@/auth`

**Vector Dimension (from project-context.md):**
- All vector columns MUST be `vector(1536)` for Gemini embedding compatibility
- The `gemini-embedding-001` model outputs 1536 dimensions by default

### Technical Implementation Notes

**Vercel AI SDK Embedding Pattern:**
```typescript
import { embed } from 'ai';
import { google } from '@ai-sdk/google';

const { embedding } = await embed({
  model: google.textEmbeddingModel('gemini-embedding-001'),
  value: textToEmbed,
});
// embedding.length === 1536
```

**pgvector Cosine Similarity Query Pattern:**
```sql
-- Lower distance = higher similarity for cosine
SELECT id, 1 - (embedding <=> $1) as similarity 
FROM jobs 
WHERE user_id = $2 
ORDER BY embedding <=> $1 
LIMIT 10;
```

**Drizzle ORM Raw SQL for pgvector:**
```typescript
import { sql } from 'drizzle-orm';

const results = await db.execute(sql`
  SELECT id, title, 
         1 - (embedding <=> ${profileEmbedding}::vector) as similarity
  FROM job
  WHERE user_id = ${userId}
  AND embedding IS NOT NULL
  ORDER BY embedding <=> ${profileEmbedding}::vector
`);
```

### Existing Schema Analysis

**Profile Schema (`src/features/profile/schema.ts`):**
- `profiles.bioEmbedding` - vector(1536) column exists, currently unpopulated
- Contains: bio, summary, name, location, skills (separate table), work_experience (separate table)
- **Embedding fields to aggregate:** bio, summary, + work experience titles/descriptions + skill names

**Job Schema (`src/features/jobs/schema.ts`):**
- `jobs.embedding` - vector(1536) column exists, currently unpopulated  
- Contains: title, description, skills (jsonb array), qualifications, technographics
- **Embedding fields to aggregate:** title, description, skills array, qualifications array

**Current Stub (profile/actions.ts line 169-173):**
```typescript
export async function updateBioEmbedding(userId: string): Promise<ActionResponse<boolean>> {
    // TODO: Implement when Gemini embedding API is integrated (Epic 5)
    console.log(`[Embedding] Queued bio embedding update for user: ${userId}`);
    return { data: true, error: null };
}
```

### Previous Story Intelligence

**From Story 4-4 (Export Actions):**
- Pattern for installing new dependencies and creating service files
- Server Action pattern with proper error handling
- Base64 encoding for transferring binary data (not needed here, but good pattern reference)
- Component integration pattern with feature folder structure

**Key Learnings:**
- Always wrap external API calls in try-catch with appropriate error handling
- Add timeout constants for external service calls
- Input validation with Zod schemas where applicable
- Test error paths, not just happy paths

### Dependencies to Install

```bash
npm install ai @ai-sdk/google
```

**Environment Variables Required:**
```env
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

### Performance Considerations

- **Embedding Generation:** ~200-500ms per request to Gemini API
- **Batch Processing:** Implement concurrency control (max 5 parallel requests) to avoid rate limiting
- **Caching Strategy:** Consider caching computed scores in a `job_matches` table with `calculatedAt` timestamp
- **Lazy Computation:** Only compute scores for jobs with embeddings (skip metadata-only jobs)

### Critical Anti-Patterns to Avoid

- 🚫 **DO NOT** embed on every page load - embeddings are expensive
- 🚫 **DO NOT** block UI while generating embeddings - use background processing
- 🚫 **DO NOT** send PII to embedding API - sanitize before embedding
- 🚫 **DO NOT** poll for score updates - use optimistic updates or invalidation
- 🚫 **DO NOT** store raw API responses - only store the embedding vector

### Migration Notes

If creating a `job_matches` table for score caching:
```sql
CREATE TABLE job_match (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  job_id TEXT NOT NULL REFERENCES job(id) ON DELETE CASCADE,
  score INTEGER NOT NULL, -- 0-100
  raw_similarity REAL, -- 0.0-1.0 for debugging
  calculated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, job_id)
);

CREATE INDEX job_match_user_idx ON job_match(user_id);
CREATE INDEX job_match_score_idx ON job_match(score DESC);
```

### Project Structure Notes

**New files to create:**
- `src/lib/gemini.ts` - Google AI provider initialization
- `src/lib/embeddings.ts` - Embedding utility functions
- `src/features/matching/schema.ts` - job_matches table schema
- `src/features/matching/actions.ts` - Scoring Server Actions
- `src/features/matching/scoring-service.ts` - Core scoring logic
- `src/features/matching/components/suitability-badge.tsx` - Score display component

**Modified files:**
- `src/features/profile/actions.ts` - Implement updateBioEmbedding()
- `src/features/ingestion/service.ts` - Add embedding generation on hydration
- `src/features/dashboard/components/job-card.tsx` - Add score display
- `src/db/schema.ts` - Export matching schema
- `.env.local` - Add GOOGLE_GENERATIVE_AI_API_KEY
- `package.json` - Add ai and @ai-sdk/google dependencies

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#AI & LLM Infrastructure]
- [Source: _bmad-output/planning-artifacts/project-context.md#Data & pgvector Precision]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 5.1]
- [Source: Vercel AI SDK Embedding Docs - ai-sdk.dev]
- [Source: pgvector Documentation - github.com/pgvector/pgvector]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- Verified implementation of Suitability Score Engine and Job Card UI updates.
- Validated all tests pass, including fixing regressions in `job-card.test.tsx` (updated to match AC4 color logic), `gdpr-purge.test.ts`, and `encryption.test.ts`.
- Confirmed full regression suite (24 test files, 130 tests) passes.
- Identified performance issue: `job_embedding_idx` was created as B-tree (default) instead of HNSW/IVFFlat for vector search, causing insert failure for large vectors. Fix applied in schema.
- Verified AC6 Performance: Single score ~4.3ms (target <100ms), Batch score (100 jobs) ~6ms (target <5s).
- Updated sprint-status to `review`.

### File List

- package.json
- src/lib/gemini.ts
- src/lib/embeddings.ts
- tests/unit/lib/embeddings.test.ts
- src/features/matching/schema.ts
- src/features/matching/actions.ts
- src/db/schema.ts
- drizzle/0003_add_matching_feature.sql
- src/features/profile/actions.ts
- tests/unit/features/profile/embedding-pipeline.test.ts
- src/features/ingestion/embedding-service.ts
- src/features/ingestion/service.ts
- tests/unit/features/ingestion/job-embedding.test.ts
- src/features/matching/scoring-service.ts
- tests/unit/features/matching/scoring.test.ts
- src/features/matching/actions.ts
- src/features/matching/components/suitability-badge.tsx
- src/features/dashboard/components/job-card.tsx
- tests/unit/features/matching/components/suitability-badge.test.tsx

- src/features/profile/actions.ts
- src/features/dashboard/actions.ts
- tests/performance/scoring-real-db.test.ts

## Change Log

- 2026-01-25: Review Complete - Fixed uncommitted tests and documented background task reliability patterns.
- 2026-01-25: Task 7 Complete - Implemented background rescoring trigger and dashboard score data injection.
- 2026-01-25: Task 6 Complete - Added SuitabilityBadge component and updated JobCard to display scores with enhanced UI.
- 2026-01-25: Task 5 Complete - Implemented pgvector scoring service with cosine similarity and batch optimization.
- 2026-01-25: Task 4 Complete - Implemented job embedding pipeline with lazy generation and background processing.
- 2026-01-25: Task 3 Complete - Implemented profile embedding pipeline with background processing and error handling.
- 2026-01-25: Task 2 Complete - Created matching feature structure, schema, and migration.
- 2026-01-25: Task 1 Complete - Installed Vercel AI SDK and Google provider. Implemented embedding utility with TDD coverage. (Tests passed).
- 2026-01-25: Story created with comprehensive context from Ultimate Story Context Engine
- Context sources: epics.md, architecture.md, project-context.md, package.json, existing schemas
- Previous story intelligence extracted from: 4-4-export-action-and-progress-feedback.md
- Web research completed: Vercel AI SDK 6, @ai-sdk/google 3.0.7, gemini-embedding-001 model
- Existing code analysis: vector(1536) already defined in db/utils.ts, stub exists in profile/actions.ts
