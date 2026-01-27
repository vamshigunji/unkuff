# Story 2.5: Apify Indeed Integration (US Market)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user,
I want to scrape high-quality job data from Indeed (US) using Apify Scrapers,
so that I can access roles specifically in tech hubs like San Francisco for Data roles.

## Acceptance Criteria

1. **Apify Indeed Provider**: Implement `ApifyIndeedProvider` using the `valig/indeed-jobs-scraper` actor.
2. **Targeted Scrape**: Configurable for `country: us`, `location: San Francisco`, and role-based keywords.
3. **Data Parity**: Scrape at least 5 jobs for "Data Analyst" and 5 jobs for "Data Scientist".
4. **Resilient Persistence**: Normalized jobs must be persisted correctly with unique hashes to prevent duplicates.
5. **Dashboard Visibility**: Ingested jobs should appear in the central Ingestion Dashboard.

## Tasks / Subtasks

- [x] Task 1: Environment & Dependency Setup
  - [x] Integrate `APIFY_TOKEN` into `.env.local`.
  - [x] Install `apify-client` dependency.
- [x] Task 2: Provider Implementation
  - [x] Create `src/features/ingestion/providers/apify-indeed.ts`.
  - [x] Implement `normalize` logic for complex Indeed JSON schema.
- [x] Task 3: Registry Integration
  - [x] Register `apifyIndeed` in `src/features/ingestion/provider-registry.ts`.
- [x] Task 4: Verification
  - [x] Run targeted scrapes for "Data Analyst" and "Data Scientist" in San Francisco.
  - [x] Verify 10 unique records in PostgreSQL.

## Dev Notes

- **Actor ID**: `TrtlecxAsNRbKl1na`
- **Pricing**: Pay-per-event ($0.08 / 1,000 results).
- **Location Focus**: USA / San Francisco.

### Project Structure Notes

- Provider: `src/features/ingestion/providers/apify-indeed.ts`
- Verification: `verify-apify.ts`

### References

- [Source: user-request-step-691]
- [Apify Docs](https://docs.apify.com/api/v2)

## Dev Agent Record

### Agent Model Used

Amelia (Developer Agent) / Gemini 1.5 Pro

### Debug Log References

- verify-apify.ts (Success: 10 jobs ingested)

### Completion Notes List

- Successfully integrated Apify Indeed Scraper.
- Verified 100% targeting for US market roles.
- Confirmed database persistence with full metadata.

### File List

- src/features/ingestion/providers/apify-indeed.ts
- src/features/ingestion/provider-registry.ts
- .env.local (Updated)
- package.json (Updated)
- verify-apify.ts
