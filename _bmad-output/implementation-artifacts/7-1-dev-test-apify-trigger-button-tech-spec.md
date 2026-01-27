# 🛠️ Technical Specification: Story 7.1

## Dev Test - Manual Apify Ingestion Trigger Button

**Story ID:** 7-1  
**Priority:** P0-CRITICAL  
**Estimated Time:** 2-4 hours  
**Assigned To:** Dev Engineer  
**Created By:** Winston (Architect)  
**Date:** 2026-01-25

---

## Overview

Build a development-only UI panel with a button that manually triggers Apify job ingestion. This allows controlled testing of the ingestion pipeline without waiting for (or implementing) the production cron scheduler.

**Key Constraint:** This feature must be **completely excluded** from production builds.

---

## Architecture Context

### Current Database State
```
Total Jobs: 30
├── User cc71d781-...: 8 jobs
└── User robust-test-user: 22 jobs
```

### Existing Infrastructure (Already Built)
- ✅ `IngestionService` class (`src/features/ingestion/service.ts`)
- ✅ `ApifyLinkedinProvider` (`src/features/ingestion/providers/apify-linkedin.ts`)
- ✅ `ApifyIndeedProvider` (`src/features/ingestion/providers/apify-indeed.ts`)
- ✅ `discoverJobs` server action (`src/features/ingestion/actions.ts`)
- ✅ Job schema and persistence (`src/features/jobs/schema.ts`)

### What This Story Adds
- 🆕 Dev Tools panel component
- 🆕 Manual trigger UI with form inputs
- 🆕 Real-time status feedback during ingestion
- 🆕 Dev-only server action with environment guard

---

## File Structure

```
src/
├── features/
│   └── dev-tools/                         # NEW FEATURE FOLDER
│       ├── components/
│       │   ├── DevToolsPanel.tsx          # Main container with env check
│       │   ├── ApifyTriggerForm.tsx       # Form with inputs + button
│       │   └── IngestionStatusCard.tsx    # Real-time status display
│       ├── actions.ts                      # Dev-only server actions
│       └── types.ts                        # TypeScript interfaces
├── app/
│   └── (dashboard)/
│       └── page.tsx                        # Add DevToolsPanel to dashboard
```

---

## Component Specifications

### 1. DevToolsPanel.tsx

**Purpose:** Container that renders dev tools ONLY in development mode.

```tsx
// src/features/dev-tools/components/DevToolsPanel.tsx
"use client";

import { ApifyTriggerForm } from "./ApifyTriggerForm";

export function DevToolsPanel() {
    // CRITICAL: Production exclusion
    if (process.env.NODE_ENV === 'production') {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <div className="bg-amber-950/90 border-2 border-dashed border-amber-500/50 
                            rounded-lg p-4 backdrop-blur-sm max-w-md">
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">🧪</span>
                    <h2 className="text-amber-400 font-semibold">
                        Dev Tools
                    </h2>
                    <span className="text-xs text-amber-600 ml-auto">
                        NOT FOR PRODUCTION
                    </span>
                </div>
                <ApifyTriggerForm />
            </div>
        </div>
    );
}
```

---

### 2. ApifyTriggerForm.tsx

**Purpose:** Form UI with inputs for job search parameters and trigger button.

```tsx
// src/features/dev-tools/components/ApifyTriggerForm.tsx
"use client";

import { useState, useTransition } from "react";
import { triggerDevIngestion } from "../actions";
import { IngestionStatusCard } from "./IngestionStatusCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type IngestionStatus = {
    phase: "idle" | "starting" | "fetching" | "persisting" | "complete" | "error";
    message: string;
    result?: {
        newJobs: number;
        duplicates: number;
        errors?: string[];
    };
};

export function ApifyTriggerForm() {
    const [isPending, startTransition] = useTransition();
    const [status, setStatus] = useState<IngestionStatus>({
        phase: "idle",
        message: "Ready to trigger ingestion",
    });

    const [formData, setFormData] = useState({
        keyword: "Data Scientist",
        location: "San Francisco",
        maxResults: "5",
        source: "linkedin" as "linkedin" | "indeed" | "both",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        setStatus({ phase: "starting", message: "🔄 Initializing Apify actor..." });

        startTransition(async () => {
            try {
                setStatus({ phase: "fetching", message: "📥 Fetching jobs from " + formData.source + "..." });

                const result = await triggerDevIngestion({
                    keyword: formData.keyword,
                    location: formData.location,
                    maxResults: parseInt(formData.maxResults),
                    source: formData.source,
                });

                if (result.error) {
                    setStatus({
                        phase: "error",
                        message: "❌ " + result.error,
                    });
                } else {
                    setStatus({
                        phase: "complete",
                        message: "✅ Ingestion complete!",
                        result: {
                            newJobs: result.data?.newJobs ?? 0,
                            duplicates: result.data?.duplicates ?? 0,
                            errors: result.data?.errors,
                        },
                    });
                }
            } catch (error) {
                setStatus({
                    phase: "error",
                    message: "❌ Unexpected error: " + String(error),
                });
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <Label className="text-amber-300 text-xs">Job Title/Keyword</Label>
                    <Input
                        value={formData.keyword}
                        onChange={(e) => setFormData(f => ({ ...f, keyword: e.target.value }))}
                        placeholder="Data Scientist"
                        className="bg-black/30 border-amber-700/50 text-white text-sm"
                    />
                </div>
                <div>
                    <Label className="text-amber-300 text-xs">Location</Label>
                    <Input
                        value={formData.location}
                        onChange={(e) => setFormData(f => ({ ...f, location: e.target.value }))}
                        placeholder="San Francisco"
                        className="bg-black/30 border-amber-700/50 text-white text-sm"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div>
                    <Label className="text-amber-300 text-xs">Max Results</Label>
                    <Select
                        value={formData.maxResults}
                        onValueChange={(v) => setFormData(f => ({ ...f, maxResults: v }))}
                    >
                        <SelectTrigger className="bg-black/30 border-amber-700/50 text-white text-sm">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="3">3 (minimal cost)</SelectItem>
                            <SelectItem value="5">5 (default)</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25 (high cost)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label className="text-amber-300 text-xs">Source</Label>
                    <Select
                        value={formData.source}
                        onValueChange={(v: any) => setFormData(f => ({ ...f, source: v }))}
                    >
                        <SelectTrigger className="bg-black/30 border-amber-700/50 text-white text-sm">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="linkedin">LinkedIn</SelectItem>
                            <SelectItem value="indeed">Indeed</SelectItem>
                            <SelectItem value="both">Both (2x cost)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="pt-2 border-t border-amber-700/30">
                <p className="text-amber-600 text-xs mb-2">
                    ⚠️ This will consume Apify API credits
                </p>
                <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-amber-600 hover:bg-amber-500 text-black font-semibold"
                >
                    {isPending ? "⏳ Running..." : "🚀 Trigger Apify Pull"}
                </Button>
            </div>

            <IngestionStatusCard status={status} />
        </form>
    );
}
```

---

### 3. IngestionStatusCard.tsx

**Purpose:** Display real-time status and results summary.

```tsx
// src/features/dev-tools/components/IngestionStatusCard.tsx

type Props = {
    status: {
        phase: string;
        message: string;
        result?: {
            newJobs: number;
            duplicates: number;
            errors?: string[];
        };
    };
};

export function IngestionStatusCard({ status }: Props) {
    if (status.phase === "idle") return null;

    const bgColor = {
        starting: "bg-blue-900/50",
        fetching: "bg-blue-900/50",
        persisting: "bg-blue-900/50",
        complete: "bg-emerald-900/50",
        error: "bg-red-900/50",
    }[status.phase] || "bg-gray-900/50";

    return (
        <div className={`${bgColor} rounded-md p-3 mt-3 text-sm`}>
            <p className="text-white font-medium">{status.message}</p>

            {status.result && (
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-emerald-800/50 rounded p-2">
                        <span className="text-emerald-300">New Jobs</span>
                        <p className="text-white text-lg font-bold">{status.result.newJobs}</p>
                    </div>
                    <div className="bg-amber-800/50 rounded p-2">
                        <span className="text-amber-300">Duplicates</span>
                        <p className="text-white text-lg font-bold">{status.result.duplicates}</p>
                    </div>
                </div>
            )}

            {status.result?.errors && status.result.errors.length > 0 && (
                <div className="mt-2 text-red-400 text-xs">
                    <p className="font-semibold">Errors:</p>
                    <ul className="list-disc list-inside">
                        {status.result.errors.map((e, i) => (
                            <li key={i}>{e}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
```

---

### 4. Server Action

**Purpose:** Execute the ingestion with production safeguard.

```typescript
// src/features/dev-tools/actions.ts
"use server";

import { auth } from "@/auth";
import { IngestionService } from "@/features/ingestion/service";
import { ApifyLinkedinProvider } from "@/features/ingestion/providers/apify-linkedin";
import { ApifyIndeedProvider } from "@/features/ingestion/providers/apify-indeed";

type DevIngestionParams = {
    keyword: string;
    location: string;
    maxResults: number;
    source: "linkedin" | "indeed" | "both";
};

type DevIngestionResult = {
    data?: {
        newJobs: number;
        duplicates: number;
        totalFound: number;
        errors?: string[];
    };
    error?: string;
};

export async function triggerDevIngestion(
    params: DevIngestionParams
): Promise<DevIngestionResult> {
    // 🛡️ PRODUCTION GUARD - This action MUST NOT run in production
    if (process.env.NODE_ENV === "production") {
        return { error: "Manual ingestion is disabled in production" };
    }

    const session = await auth();
    if (!session?.user?.id) {
        return { error: "Unauthorized - Please log in" };
    }

    // Select providers based on source
    const providers = [];
    if (params.source === "linkedin" || params.source === "both") {
        providers.push(new ApifyLinkedinProvider());
    }
    if (params.source === "indeed" || params.source === "both") {
        providers.push(new ApifyIndeedProvider());
    }

    if (providers.length === 0) {
        return { error: "No valid provider selected" };
    }

    const service = new IngestionService(providers);

    try {
        console.log(`🧪 [DEV] Triggering manual ingestion: ${params.keyword} in ${params.location}`);

        const result = await service.run(session.user.id, params.keyword, {
            location: params.location,
            limit: params.maxResults,
        });

        // Calculate new vs duplicates
        // Note: Current implementation returns all persisted jobs
        // We can enhance this later to track actual new vs updated
        const newJobs = result.jobs.length;
        const duplicates = result.totalFound - newJobs;

        console.log(`🧪 [DEV] Ingestion complete: ${newJobs} new, ${duplicates} duplicates`);

        return {
            data: {
                newJobs,
                duplicates: Math.max(0, duplicates),
                totalFound: result.totalFound,
                errors: result.errors,
            },
        };
    } catch (error) {
        console.error("🧪 [DEV] Ingestion error:", error);
        return { error: String(error) };
    }
}
```

---

## Integration Point

Add the DevToolsPanel to the dashboard layout:

```tsx
// src/app/(dashboard)/page.tsx (or layout.tsx)

import { DevToolsPanel } from "@/features/dev-tools/components/DevToolsPanel";

export default function DashboardPage() {
    return (
        <>
            {/* Existing dashboard content */}
            <main>
                {/* ... kanban board, etc. */}
            </main>

            {/* Dev Tools - auto-excluded in production */}
            <DevToolsPanel />
        </>
    );
}
```

---

## Environment Variables

No new environment variables required. Uses existing:
- `APIFY_TOKEN` ✅ Already configured

---

## Testing Checklist

### Development Mode
- [ ] Dev Tools panel appears in bottom-right corner
- [ ] Form inputs accept custom values
- [ ] "Trigger Apify Pull" button initiates ingestion
- [ ] Status updates show: Starting → Fetching → Complete
- [ ] Results summary shows new jobs count
- [ ] Results summary shows duplicates count
- [ ] Errors display inline if Apify fails
- [ ] Kanban board shows new jobs after refresh

### Production Build Verification
```bash
# Build for production
npm run build

# Verify no dev tools code in bundle
grep -r "Dev Tools" .next/static || echo "✅ No dev tools in prod bundle"
grep -r "triggerDevIngestion" .next/static || echo "✅ No dev action in prod bundle"
```

- [ ] `npm run build` succeeds without errors
- [ ] No "Dev Tools" strings in `.next/static/` output
- [ ] Server action returns error if somehow called in production

---

## Definition of Done

- [ ] Feature folder created: `src/features/dev-tools/`
- [ ] DevToolsPanel renders only in development mode
- [ ] ApifyTriggerForm accepts keyword, location, maxResults, source
- [ ] triggerDevIngestion server action executes with production guard
- [ ] Real-time status feedback displays during ingestion
- [ ] Results summary shows new vs. duplicate counts
- [ ] Production build excludes all dev tools code
- [ ] Manual testing confirms LinkedIn and Indeed providers work
- [ ] Code reviewed and approved

---

## Potential Enhancements (Out of Scope)

These are NOT required for Story 7.1 but could be added later:

- Persist trigger history to localStorage
- Add "Clear all jobs" dev utility
- Add database stats display (total jobs, by user)
- Add embedding status indicator

---

## Questions for Architect

If you have questions during implementation, use the `/architect` workflow and select `[CH]` to chat.

---

*Technical Spec generated by Winston (Architect) — 2026-01-25*
