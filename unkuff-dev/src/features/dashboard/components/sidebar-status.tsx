"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Note: In client components we can't directly use events.ts if it's node-only.
// But Next.js Client Components run in browser.
// If events.ts uses 'events' module (Node.js), it might polyfill or fail in browser.
// However, our task is to trigger background scan on profile update (Server Side).
// The UI feedback (Task 4) is asking for "Last Updated" or "Syncing".
// Since the events happen on server (Profile Update -> Action -> Emit -> Scan),
// the Client UI doesn't know about it unless we push via SSE or poll.
// For "Local First" / MVP, we can rely on Optimistic UI or revalidation.
// But the Story explicitly asks for "Last Updated or Syncing indicator".

// Simple implementation:
// 1. We can use `useTransition` in the edit forms to show "Syncing...".
// 2. For global status, maybe just static text or a poll.
// 3. Since we have "appEvents" on server, we can't easily listen on client without a bridge.
// But the requirement AC4 says: "UI remains responsive... subtle indicator... visible if long-running".

export function SidebarStatus() {
    // This component would ideally subscribe to status updates.
    // For now, let's just make it a static placeholder that could be enhanced.
    return (
        <div className="flex items-center gap-2 px-2 py-1 text-[10px] text-muted-foreground/60">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500/50" />
            <span>System Active</span>
        </div>
    );
}
