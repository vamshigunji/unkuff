---
id: 7-5
title: "Scheduled Background Ingestion (Cron Job)"
epic: 7
priority: P3-LOW
status: backlog
created: 2026-01-25
tags: [cron, scheduler, production, background-job]
production_only: true
---

# Story 7.5: Scheduled Background Ingestion (Cron Job)

## 🚨 PRODUCTION FEATURE

> **Note:** This story is for **production deployment only**. During development and testing, use the manual trigger button from Story 7.1.

---

## User Story

As a **candidate with active job criteria**,
I want the system to **automatically refresh my job recommendations** on a schedule,
So that I **receive fresh opportunities without manually triggering searches**.

---

## Context

### Refresh Strategy

| User Status | Refresh Frequency | Rationale |
|-------------|-------------------|-----------|
| Active today | Every 2-4 hours | High engagement = fresh data |
| Active this week | Every 6 hours | Moderate priority |
| Inactive > 3 days | Paused | Save API credits |
| New criteria enabled | Immediate | First pull on enable |

---

## Acceptance Criteria

### AC1: Cron Job Infrastructure
- **Given** production deployment
- **When** the scheduler runs
- **Then** it executes every 4 hours (configurable)
- **And** uses Vercel Cron Jobs or equivalent serverless scheduler

### AC2: Smart User Targeting
- **Given** the cron job triggers
- **When** selecting users for refresh
- **Then** only users with:
  - Active criteria (isActive = true)
  - Activity within last 7 days
- **And** users inactive > 7 days are skipped

### AC3: Rate Limiting & Budget Control
- **Given** multiple users need refresh
- **When** processing the queue
- **Then** the system:
  - Processes max 10 unique criteria sets per run
  - Respects Apify rate limits
  - Logs credit consumption estimates

### AC4: Failure Resilience
- **Given** an Apify call fails
- **When** the error is caught
- **Then** the system:
  - Logs the failure with criteria ID
  - Continues processing other criteria
  - Marks failed criteria for retry in next run
  - Does NOT crash the entire job

### AC5: Observability
- **Given** the cron job completes
- **When** admins check logs
- **Then** they see:
  - Start/end timestamps
  - Number of criteria processed
  - Total jobs ingested
  - Credit usage estimate
  - Any errors encountered

---

## Technical Implementation

### Vercel Cron Configuration

```typescript
// vercel.json
{
  "crons": [{
    "path": "/api/cron/ingest-jobs",
    "schedule": "0 */4 * * *"  // Every 4 hours
  }]
}
```

### Cron Handler

```typescript
// src/app/api/cron/ingest-jobs/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    // Verify cron authorization
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Get active criteria from all eligible users
    // 2. Deduplicate criteria sets
    // 3. Process each unique criteria
    // 4. Create user_job links for all matching users
    
    return NextResponse.json({ processed: count, status: 'complete' });
}
```

---

## Dependencies

- Story 7.1 (Dev Test Button) ✅ Must be tested first
- Story 7.2 (Shared Job Pool) - required for efficiency
- Story 7.3 (Criteria Management) - must have criteria to refresh
- Story 7.4 (Criteria Deduplication) - prevents duplicate scrapes

---

## Deployment Notes

1. **Environment Variable:** `CRON_SECRET` must be set for security
2. **Vercel Plan:** Requires Vercel Pro or Team for cron jobs
3. **Alternative:** Can use pg_cron if self-hosting PostgreSQL

---

## Estimation

| Aspect | Estimate |
|--------|----------|
| **Complexity** | Medium-High |
| **Time** | 4-6 hours |
| **Risk** | Medium (production infra) |
