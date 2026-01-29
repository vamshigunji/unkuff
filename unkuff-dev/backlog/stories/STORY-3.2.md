# STORY-3.2: CRUD Operations for Resume Versions

## Goal
Enable users to persist their hard work by creating, naming, and managing multiple versions of their tailored resumes.

## Problem Statement
Users spend time tailoring their resume for specific jobs, but without a database, they lose those changes when they switch contexts or jobs. They need a way to "snapshot" their progress.

## Acceptance Criteria
- [ ] Implement `saveResumeVersion` server action.
- [ ] Database table `generated_resumes` must store `content` (JSON), `name`, and `job_id`.
- [ ] Users must be able to rename a version via a "Rename" modal.
- [ ] Users must be able to hard-delete a version with a confirmation prompt.
- [ ] The Resume Database view must list all entries for the logged-in user, ordered by `updated_at`.

### Input JSON (Save Version)
```json
{
  "action": "CREATE_VERSION",
  "payload": {
    "name": "Uber DS - Metric Optimized",
    "jobId": "uuid-1234",
    "content": { "summary": "Highly motivated...", "experience": [] }
  }
}
```

### Output JSON (Confirmation)
```json
{
  "status": "created",
  "version_id": "uuid-5678",
  "storage_path": "db/generated_resumes/uuid-5678"
}
```
