/**
 * Dev Tools Panel
 * Story 7.1: Container with environment check
 * AC1: Dev Environment Detection
 * AC5: Production Build Exclusion
 */
"use client";

import { useState } from "react";
import { ApifyTriggerForm } from "./ApifyTriggerForm";
import { ChevronDown, ChevronUp, FlaskConical } from "lucide-react";

export function DevToolsPanel() {
    // 🛡️ CRITICAL: enabled in production as per user request for testing
    // if (process.env.NODE_ENV === "production") {
    //     return null;
    // }

    const [isExpanded, setIsExpanded] = useState(true);
    const [isMinimized, setIsMinimized] = useState(false);

    if (isMinimized) {
        return (
            <button
                onClick={() => setIsMinimized(false)}
                className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full bg-amber-600 hover:bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-900/50 transition-all duration-200 hover:scale-105"
                title="Open Dev Tools"
            >
                <FlaskConical className="h-5 w-5 text-black" />
            </button>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <div className="bg-amber-950/95 border-2 border-dashed border-amber-500/50 rounded-lg backdrop-blur-sm max-w-sm shadow-xl shadow-black/50">
                {/* Header */}
                <div className="flex items-center gap-2 p-3 border-b border-amber-700/30">
                    <FlaskConical className="h-4 w-4 text-amber-400" />
                    <h2 className="text-amber-400 font-semibold text-sm flex-1">
                        Dev Tools
                    </h2>
                    <span className="text-[10px] text-amber-600 bg-amber-900/50 px-1.5 py-0.5 rounded">
                        DEV ONLY
                    </span>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-amber-500 hover:text-amber-300 p-1"
                    >
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                    </button>
                    <button
                        onClick={() => setIsMinimized(true)}
                        className="text-amber-500 hover:text-amber-300 text-xs px-1.5"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                {isExpanded && (
                    <div className="p-3">
                        <ApifyTriggerForm />
                    </div>
                )}
            </div>
        </div>
    );
}
