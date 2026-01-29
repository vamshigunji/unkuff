# STORY-4.1: Resume Persistence Bridge

## Goal
Establish a real-time or manual sync between the user's edits in the full-screen cinematic editor and the permanent Postgres database.

## Problem Statement
The `AIResumeEditor` uses a `contentEditable` surface for its high-fidelity feel. However, any changes made to text (bullet points, summaries, skills) are currently held only in local component state. If the user refreshes or navigates away, hours of tailoring work can be lost because there is no "bridge" to save the `innerText` back to the `generated_resumes` table.

## Acceptance Criteria
- [ ] Implement a `saveResumeContent` Server Action in `src/features/resume/actions/index.ts`.
- [ ] The "Save Resume" button must trigger a sync of the current `innerText` from the `editorRef`.
- [ ] Add a "Dirty State" indicator: Show "Unsaved Changes" if the editor content differs from the last saved DB record.
- [ ] Implement an "Auto-Save" debounced timer (e.g., every 30 seconds of inactivity).
- [ ] **AC-JSON-VERIFY**: The sync operation must follow this payload structure:

### Input JSON (Client-to-Server Sync)
```json
{
  "action": "SYNC_CONTENT",
  "payload": {
    "resume_id": "res-999",
    "raw_text": "Full extracted resume text with edits...",
    "metadata": {
      "word_count": 450,
      "last_edit_timestamp": "2026-01-29T06:45:00Z"
    }
  }
}
```

### Output JSON (Persistence Confirmation)
```json
{
  "status": "synced",
  "data": {
    "db_id": "res-999",
    "version": 4,
    "saved_at": "2026-01-29T06:45:05Z",
    "checksum": "sha256-xyz789"
  }
}
```
