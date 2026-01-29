# STORY-3.1: Resume Database Portal UI

## Goal
Establish a centralized "Mission Control" hub for candidates to manage their entire library of tailored resumes and drafts.

## Problem Statement
The "Compare" button in the AI Editor is currently a placeholder. Users have no way to view their history of tailored resumes, meaning they must start from scratch or stay locked in a single session. This lacks the professional "document management" feel required for a premium SaaS application.

## Acceptance Criteria
- [ ] Replace the "Compare" button in the `AIResumeEditor` with a "Resume Database" button.
- [ ] Create a new Next.js route at `/dashboard/database`.
- [ ] Implement a Grid/List view that displays cards for each resume in the `generated_resumes` table.
- [ ] Cards must show the Resume Name, Target Company, and "Last Updated" timestamp.
- [ ] The UI must maintain the "Liquid Glass" / Charcoal aesthetic of the dashboard.
- [ ] **AC-JSON-VERIFY**: The UI must correctly parse and render the following resume list JSON:

### Input JSON (API Fetch Result)
```json
[
  {
    "id": "res_8821",
    "name": "Uber Senior DS - Final",
    "target_company": "Uber",
    "updated_at": "2026-01-29T06:15:00Z",
    "status": "active"
  },
  {
    "id": "res_9904",
    "name": "Notion Growth Tailor",
    "target_company": "Notion",
    "updated_at": "2026-01-28T14:22:00Z",
    "status": "archived"
  }
]
```

### Output JSON (Navigation Action)
```json
{
  "action": "LOAD_RESUME_VERSION",
  "payload": {
    "resume_id": "res_8821",
    "target_view": "editor",
    "preserve_history": true
  }
}
```
