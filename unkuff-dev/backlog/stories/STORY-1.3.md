# STORY-1.3: Cost-Optimized Recommendation Persistence

## Goal
Store AI-generated keyword recommendations in the database during the initial scan to avoid repeated API calls when users view tooltips.

## Problem Statement
Generating advice for missing keywords requires an LLM. If we generate this advice every time a user clicks a "Missing" keyword in the sidebar, it will significantly increase API latency and costs.

## Acceptance Criteria
- [ ] Update the `job_match` database schema to include a `recommendation_map` JSONB field.
- [ ] Modify the `ATS Scorer` AI prompt to return a mapping of `keyword` -> `actionable_tip`.
- [ ] Ensure the `generateHighFidelityScore` service persists this map during the `UPSERT` operation.
- [ ] **AC-JSON-VERIFY**: The system must accept and return the following JSON structure:

### Input JSON (Internal Service Object)
```json
{
  "keywords": ["GCP", "Python"],
  "generate_tips": true,
  "context": "Data Scientist at Notion"
}
```

### Output JSON (Database Record Structure)
```json
{
  "job_match_id": "uuid-123",
  "recommendation_map": {
    "GCP": "Mention BigQuery usage in your recent Google projects.",
    "Python": "Highlight pandas and scikit-learn specifically for data cleaning."
  }
}
```
