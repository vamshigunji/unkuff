# STORY-4.5: Discovery Progress Fix

## Goal
Stabilize the onboarding experience by resolving API errors and ensuring the "Discovery Flow" (profile creation) is 100% reliable for new users.

## Problem Statement
The server logs currently show frequent 404 errors on the `/api/discovery-progress` endpoint. This causes the onboarding UI to hang, preventing new users from reaching the dashboard or creating their first tailored resume. This is a critical blocker for user acquisition.

## Acceptance Criteria
- [ ] Fix the routing for `/api/discovery-progress` in the Next.js App Router.
- [ ] Implement a robust state handler for the discovery database record.
- [ ] Ensure the UI polls this endpoint and correctly transitions the user to the dashboard once the profile is "Ready."
- [ ] **AC-JSON-VERIFY**: The endpoint must return the following progress object:

### Input JSON (Polling Request)
```json
{
  "user_id": "uuid-1234",
  "request_type": "status_check"
}
```

### Output JSON (Onboarding State)
```json
{
  "user_id": "uuid-1234",
  "status": "in_progress",
  "percentage": 85,
  "current_stage": "EMBEDDING_GENERATION",
  "error": null
}
```
