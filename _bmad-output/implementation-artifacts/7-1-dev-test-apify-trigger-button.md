---
id: 7-1
title: "Dev Test: Manual Apify Ingestion Trigger Button"
epic: 7
priority: P0-CRITICAL
status: done
created: 2026-01-25
assigned_to: dev-engineer
pm_action_required: false
tags: [dev-tool, testing, apify, ingestion]
production_cleanup_required: true
---

# Story 7.1: Dev Test - Manual Apify Ingestion Trigger Button

## 🚨 PM ACTION REQUIRED

**Priority Override:** This story is marked **P0-CRITICAL** and should be the **NEXT** work item for the Dev Engineer.

**Rationale:** The architect has identified that we need a manual testing mechanism to validate the Apify ingestion flow without incurring unnecessary costs during development. This is a prerequisite for testing the full data orchestration architecture.

---

## User Story

As a **developer (during testing phase)**,
I want a **manual trigger button** in the dev environment to initiate an Apify data pull on-demand,
So that I can **test the ingestion pipeline without automated cron jobs** and control exactly when API credits are consumed.

---

## Context

### Current State Analysis (from Architect)

| Metric | Value |
|--------|-------|
| **Total Jobs in DB** | 30 |
| **User 1** (`cc71d781-...`) | 8 jobs |
| **User 2** (`robust-test-user`) | 22 jobs |

The current ingestion only triggers when a user manually searches. There is no background refresh mechanism yet. This story provides a **controlled testing interface** before the production cron architecture is implemented.

### Why This Matters

1. **Cost Control:** Apify has usage limits (credits per month). Random testing wastes credits.
2. **Reproducibility:** Developers need deterministic triggers to test deduplication, normalization, and error handling.
3. **Debugging:** A manual button with live feedback helps debug issues faster than scheduled jobs.

---

## Acceptance Criteria

### AC1: Dev Environment Detection
- **Given** the application is running in `NODE_ENV=development`
- **When** the dev accesses the Dashboard or a dedicated Dev Tools page
- **Then** a clearly marked "🧪 Dev Tools" section is visible
- **And** this section is **NOT visible** in production builds

### AC2: Manual Trigger Button UI
- **Given** the Dev Tools section
- **When** the dev views the ingestion controls
- **Then** a button labeled "🚀 Trigger Apify Pull" is available
- **And** the button includes helper text explaining it will consume API credits
- **And** input fields allow specifying:
  - `Job Title/Keyword` (required)
  - `Location` (optional, defaults to user's criteria or "United States")
  - `Max Results` (optional, defaults to 5 for cost savings)
  - `Source` (dropdown: LinkedIn, Indeed, Both)

### AC3: Real-Time Ingestion Feedback
- **Given** the dev clicks "Trigger Apify Pull"
- **When** the ingestion service runs
- **Then** the UI shows a real-time status:
  - "🔄 Starting Apify actor..."
  - "📥 Fetching results from LinkedIn..."
  - "💾 Persisting X jobs to database..."
  - "✅ Complete: X new jobs, Y duplicates skipped"
- **And** errors are displayed inline with actionable messages

### AC4: Results Summary
- **Given** ingestion completes successfully
- **When** the dev views the results
- **Then** a summary card shows:
  - Total jobs fetched
  - New jobs inserted
  - Duplicates detected (skipped)
  - Any errors or warnings
- **And** a "Refresh Kanban" button is available to see new jobs on the board

### AC5: Production Build Exclusion
- **Given** the application is built for production (`npm run build`)
- **When** the build artifact is deployed
- **Then** all Dev Tools components are **tree-shaken out**
- **And** the route/endpoint for manual triggering returns 404 or is completely removed
- **And** NO traces of the dev button exist in client-side JavaScript

---

## Technical Implementation Notes

### File Structure
```
src/
├── features/
│   └── dev-tools/
│       ├── components/
│       │   └── ApifyTriggerButton.tsx   # The manual trigger UI
│       ├── actions.ts                     # Server action for dev-only trigger
│       └── DevToolsPanel.tsx             # Container with env check
├── app/
│   └── (dashboard)/
│       └── dev/
│           └── page.tsx                   # Dev tools page (dev only)
```

### Environment Guard Pattern
```typescript
// src/features/dev-tools/DevToolsPanel.tsx
export function DevToolsPanel() {
    // Production exclusion - component returns null in prod
    if (process.env.NODE_ENV === 'production') {
        return null;
    }
    
    return (
        <div className="border-2 border-dashed border-amber-500/50 rounded-lg p-4">
            <h2 className="text-amber-400">🧪 Dev Tools - NOT FOR PRODUCTION</h2>
            <ApifyTriggerButton />
        </div>
    );
}
```

### Server Action Guard
```typescript
// src/features/dev-tools/actions.ts
"use server";

export async function triggerManualIngestion(params: IngestionParams) {
    // Hard block in production
    if (process.env.NODE_ENV === 'production') {
        throw new Error("Manual ingestion is disabled in production");
    }
    
    // ... rest of implementation
}
```

---

## Out of Scope

- ❌ Cron/scheduled job infrastructure (Story 7.3)
- ❌ Shared job pool architecture (Story 7.2)
- ❌ Multi-user criteria deduplication (Story 7.4)
- ❌ Production background refresh (Story 7.5)

---

## Definition of Done

- [ ] Dev Tools panel renders only in development mode
- [ ] Manual Apify trigger button is functional and initiates real ingestion
- [ ] Real-time status feedback displays during ingestion
- [ ] Results summary shows new vs. duplicate job counts
- [ ] `npm run build` produces a bundle with zero dev tools code
- [ ] Manual testing confirms button works with LinkedIn and Indeed providers
- [ ] Code reviewed and approved

---

## Production Cleanup Note

> ⚠️ **IMPORTANT:** This feature is intentionally scoped for **development and testing only**.
> 
> When transitioning to production:
> 1. The `/dev` route will be excluded via Next.js route guards
> 2. The `DevToolsPanel` component tree-shakes to null in prod builds
> 3. The server action throws in production as a failsafe
>
> **No additional work is required for production cleanup** — the guards are built-in.

---

## Estimation

| Aspect | Estimate |
|--------|----------|
| **Complexity** | Low-Medium |
| **Time** | 2-4 hours |
| **Risk** | Low (dev-only feature) |

---

## Dependencies

- Existing Apify provider infrastructure (Stories 2.1, 2.5) ✅ DONE
- Ingestion service and job persistence (Story 2.4) ✅ DONE
