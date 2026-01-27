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
    const [isDiscoveryActive, setIsDiscoveryActive] = useState(false);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const response = await fetch("/api/discovery-progress");
                if (response.ok) {
                    const data = await response.json();
                    setIsDiscoveryActive(data.status === "in_progress");
                }
            } catch (error) {
                // Silently fail
            }
        };
        checkStatus();
        const interval = setInterval(checkStatus, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center gap-2.5 px-3 py-2 mx-1 my-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className={cn(
                "h-2 w-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]",
                isDiscoveryActive ? "bg-primary animate-pulse shadow-primary/50" : "bg-emerald-500 shadow-emerald-500/50"
            )} />
            <div className="flex flex-col">
                <span className="text-[10px] font-bold text-foreground/90 uppercase tracking-tighter">
                    {isDiscoveryActive ? "Discovery In Progress" : "System Synchronized"}
                </span>
                <span className="text-[9px] text-muted-foreground/60 font-medium italic">
                    {isDiscoveryActive ? "Scanning Job Boards..." : "All sources up to date"}
                </span>
            </div>
        </div>
    );
}
