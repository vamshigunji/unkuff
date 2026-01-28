"use client";

import { useEffect, useState, useRef } from "react";
import { Terminal, RefreshCw, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LiveLogsViewer() {
    const [logs, setLogs] = useState<any[]>([]);
    const [isPaused, setIsPaused] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const fetchLogs = async () => {
        if (isPaused) return;
        try {
            const res = await fetch("/api/dev/logs");
            const data = await res.json();
            setLogs(data);
        } catch (e) {
            console.error("Failed to fetch logs");
        }
    };

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 2000);
        return () => clearInterval(interval);
    }, [isPaused]);

    useEffect(() => {
        if (scrollRef.current && !isPaused) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs, isPaused]);

    return (
        <div className="flex flex-col h-[300px] bg-black rounded-lg border border-amber-500/30 overflow-hidden font-mono text-[10px]">
            {/* Toolbar */}
            <div className="flex items-center gap-2 p-2 bg-amber-950/50 border-b border-amber-900/50 shrink-0">
                <Terminal className="w-3 h-3 text-amber-400" />
                <span className="text-amber-400 font-bold uppercase tracking-widest flex-1">System Telemetry</span>
                <button 
                    onClick={() => setIsPaused(!isPaused)}
                    className={cn("p-1 rounded hover:bg-white/10", isPaused ? "text-emerald-400" : "text-amber-400")}
                >
                    <RefreshCw className={cn("w-3 h-3", !isPaused && "animate-spin-slow")} />
                </button>
            </div>

            {/* Log Stream */}
            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-hide"
            >
                {logs.length === 0 && <div className="text-muted-foreground animate-pulse italic">Waiting for events...</div>}
                {[...logs].reverse().map((log, i) => (
                    <div key={log.id || i} className="flex gap-2 group">
                        <span className="text-white/20 shrink-0">[{new Date(log.createdAt).toLocaleTimeString()}]</span>
                        <span className={cn(
                            "shrink-0 font-bold uppercase px-1 rounded-[2px]",
                            log.level === 'error' ? "bg-red-500/20 text-red-400" : 
                            log.level === 'ai' ? "bg-blue-500/20 text-blue-400" :
                            "bg-amber-500/20 text-amber-400"
                        )}>
                            {log.module}
                        </span>
                        <span className={cn(
                            "break-words",
                            log.level === 'error' ? "text-red-400" : "text-amber-100/90"
                        )}>
                            {log.message}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
