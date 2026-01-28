/**
 * Dev Tools Panel
 * Story 7.1: Container with environment check
 * AC1: Dev Environment Detection
 * AC5: Production Build Exclusion
 */
"use client";

import { useState } from "react";
import { ApifyTriggerForm } from "./ApifyTriggerForm";
import { LiveLogsViewer } from "./LiveLogsViewer";
import { ChevronDown, ChevronUp, FlaskConical, Terminal, Database } from "lucide-react";
import { cn } from "@/lib/utils";

type DevTab = "ingestion" | "logs";

export function DevToolsPanel() {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isMinimized, setIsMinimized] = useState(false);
    const [activeTab, setActiveTab] = useState<DevTab>("logs");

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
        <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm">
            <div className="bg-neutral-950/95 border-2 border-dashed border-amber-500/50 rounded-lg backdrop-blur-sm shadow-2xl shadow-black overflow-hidden">
                {/* Header */}
                <div className="flex items-center gap-2 p-3 border-b border-amber-700/30 bg-amber-950/20">
                    <FlaskConical className="h-4 w-4 text-amber-400" />
                    <h2 className="text-amber-400 font-semibold text-sm flex-1">
                        Subu Debug HUD
                    </h2>
                    <div className="flex bg-black/40 rounded-md p-0.5 border border-white/5 mr-2">
                        <button 
                            onClick={() => setActiveTab("logs")}
                            className={cn(
                                "p-1.5 rounded transition-all",
                                activeTab === "logs" ? "bg-amber-600 text-black shadow-inner" : "text-amber-500/50 hover:text-amber-400"
                            )}
                        >
                            <Terminal size={12} />
                        </button>
                        <button 
                            onClick={() => setActiveTab("ingestion")}
                            className={cn(
                                "p-1.5 rounded transition-all",
                                activeTab === "ingestion" ? "bg-amber-600 text-black shadow-inner" : "text-amber-500/50 hover:text-amber-400"
                            )}
                        >
                            <Database size={12} />
                        </button>
                    </div>
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
                        {activeTab === "ingestion" ? <ApifyTriggerForm /> : <LiveLogsViewer />}
                    </div>
                )}
            </div>
        </div>
    );
}
