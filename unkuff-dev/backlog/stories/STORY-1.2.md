# STORY-1.2: Missing Keyword Strategy Tooltips

## Goal
Provide immediate, actionable AI-driven advice for keywords missing from the resume, helping users optimize their match score without multiple API calls.

## Problem Statement
When a keyword is "Missing," users know they need to add it, but they often don't know *where* or *how* to phrase it. Calculating this in real-time on every click would be expensive and slow.

## Acceptance Criteria
- [ ] Sidebar keywords of type "missing" must trigger a tooltip on click.
- [ ] Tooltip content must pull from the `recommendation_map` stored in the `job_match` record.
- [ ] If no pre-calculated advice exists, show a "Recalculate Scan" fallback message.
- [ ] UI must use the "Liquid Glass" theme (glassmorphism background, high contrast text).

### Input JSON (Click Event)
```json
{
  "action": "show_tooltip",
  "payload": {
    "keyword": "GCP",
    "type": "missing"
  }
}
```

### Output JSON (Tooltip Data Retrieval)
```json
{
  "status": "active",
  "payload": {
    "keyword": "GCP",
    "strategy": "Mention your use of BigQuery and Cloud Run under the Google Analyst role to satisfy this requirement.",
    "impact_boost_estimate": "+8 UHS"
  }
}
```
