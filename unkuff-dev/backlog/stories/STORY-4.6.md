# STORY-4.6: Dashboard Search & Advanced Filtering

## Goal
Transform the dashboard from a simple list into a powerful search engine for job opportunities and match analytics.

## Problem Statement
As the system scrapes more jobs, the dashboard becomes cluttered. Users cannot quickly find roles at specific companies (e.g., "Google") or filter for roles where their UHS score is above 80. This leads to information overload and makes the app feel "crowded."

## Acceptance Criteria
- [ ] Add a "Real-Time Search" bar to the dashboard that filters by Job Title and Company.
- [ ] Implement "Quick Filter" tabs: `High Matches (>80)`, `Recent`, and `SaaS Roles`.
- [ ] Add a sort toggle for `Score (Desc)` and `Date (Newest)`.
- [ ] **AC-JSON-VERIFY**: The filter engine must handle the following payload:

### Input JSON (Filter Application)
```json
{
  "action": "APPLY_FILTERS",
  "payload": {
    "search_term": "Analyst",
    "min_score": 75,
    "sort_by": "score_desc",
    "tags": ["remote"]
  }
}
```

### Output JSON (Filtered Result Set)
```json
{
  "results_count": 12,
  "applied_filters": ["Analyst", ">75 UHS"],
  "items": [ { "id": "job-1", "title": "Senior Analyst", "score": 88 } ]
}
```
