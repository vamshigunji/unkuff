# STORY-3.3: Archive & Recovery Workflow

## Goal
Enable users to declutter their active workspace without permanently losing their work by archiving and restoring older resume versions.

## Problem Statement
As users apply to more jobs, the number of resumes in the database will grow. Deleting old versions is permanent and risky if they want to reuse a specific phrasing or metric optimization later. An archive system allows for a "hidden but saved" state that keeps the UI clean while preserving data.

## Acceptance Criteria
- [ ] Add a `status` column to the `generated_resumes` table with an enum: `['active', 'archived', 'deleted']`.
- [ ] Implement an "Archive" action on resume cards in the database view.
- [ ] Implement a "Restore" action to move archived resumes back to `active`.
- [ ] Create a filter toggle in the Resume Database UI to "Show Archived" resumes.
- [ ] Ensure archived resumes are visually distinct (e.g., lower opacity or "Archived" badge).
- [ ] **AC-JSON-VERIFY**: The system must handle the following state transition:

### Input JSON (Archive Request)
```json
{
  "action": "TOGGLE_ARCHIVE",
  "payload": {
    "resume_id": "res_8821",
    "target_status": "archived"
  }
}
```

### Output JSON (State Change Confirmation)
```json
{
  "status": "success",
  "data": {
    "resume_id": "res_8821",
    "previous_status": "active",
    "current_status": "archived",
    "visibility": "hidden_by_default"
  }
}
```
