
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, ChevronDown } from "lucide-react";
import type { GapSchema } from "../schema";

interface RedZoneListProps {
    gapAnalysis: GapSchema | null;
    isLoading?: boolean;
    className?: string;
}

export function RedZoneList({ gapAnalysis, isLoading, className }: RedZoneListProps) {
    if (isLoading) {
        return (
            <div className="space-y-4 animate-pulse">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-amber-500/20 rounded-full" />
                    <div className="h-4 bg-amber-500/20 rounded w-1/3" />
                </div>
                <div className="h-20 bg-amber-500/10 rounded border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]" />
                <div className="h-20 bg-amber-500/10 rounded border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]" />
            </div>
        );
    }

    if (!gapAnalysis || !gapAnalysis.gaps || gapAnalysis.gaps.length === 0) {
        return null;
    }

    return (
        <div className={cn("space-y-4", className)}>
            <div className="flex items-center gap-2 text-amber-500">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Red Zone Matches</h3>
            </div>

            <div className="grid gap-3">
                {gapAnalysis.gaps.map((gap, idx) => (
                    <GapItem key={idx} gap={gap} />
                ))}
            </div>
        </div>
    );
}

function GapItem({ gap }: { gap: any }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div
            className={cn(
                "group rounded-md bg-amber-950/10 border border-amber-500/30 overflow-hidden transition-all duration-300 hover:bg-amber-950/20",
                "shadow-[0_0_10px_rgba(245,158,11,0.15)] animate-[pulse_4s_ease-in-out_infinite]" // Slow Amber Oscillation
            )}
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-3 text-left"
            >
                <div className="flex items-center gap-3">
                    <div className="relative flex items-center justify-center w-2 h-2">
                        <span className="absolute w-2 h-2 bg-amber-500 rounded-full animate-ping opacity-75"></span>
                        <span className="relative w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-wider text-amber-500/70 font-semibold text-left">Missing Keyword</span>
                        <span className="text-sm font-bold text-amber-100">{gap.missing}</span>
                    </div>
                </div>
                <ChevronDown className={cn(
                    "w-4 h-4 text-amber-500/50 transition-transform duration-200",
                    isOpen && "rotate-180"
                )} />
            </button>

            <div className={cn(
                "px-3 text-xs text-amber-200/80 transition-all duration-300 ease-in-out grid",
                isOpen ? "grid-rows-[1fr] pb-3 opacity-100" : "grid-rows-[0fr] opacity-0"
            )}>
                <div className="overflow-hidden space-y-3 pt-2 border-t border-amber-500/20">
                    {gap.closest_match && (
                        <div>
                            <span className="text-[9px] uppercase tracking-widest text-amber-500/60 block mb-0.5">Closest Truth Anchor</span>
                            <p className="text-amber-50 font-medium bg-amber-500/10 px-2 py-1 rounded border border-amber-500/10 inline-block">
                                {gap.closest_match}
                            </p>
                        </div>
                    )}
                    <div>
                        <span className="text-[9px] uppercase tracking-widest text-amber-500/60 block mb-0.5">Gap Analysis</span>
                        <p className="leading-relaxed">{gap.reason}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
