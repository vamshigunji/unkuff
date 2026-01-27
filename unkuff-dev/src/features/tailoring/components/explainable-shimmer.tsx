"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export type TailoringStatus = "thinking" | "mapping" | "refining" | "grounding" | "complete" | "idle" | "error";

interface ExplainableShimmerProps {
    status: TailoringStatus;
    message?: string;
    className?: string;
}

export function ExplainableShimmer({ status, message, className }: ExplainableShimmerProps) {
    if (status === "idle") return null;

    const getStatusConfig = () => {
        switch (status) {
            case "thinking": return { color: "bg-amber-500", text: "Thinking..." };
            case "mapping": return { color: "bg-blue-500", text: "Mapping skills..." };
            case "refining": return { color: "bg-purple-500", text: "Refining content..." };
            case "grounding": return { color: "bg-teal-500", text: "Grounding facts..." };
            case "complete": return { color: "bg-emerald-400", text: "Complete!" };
            case "error": return { color: "bg-red-500", text: "Error" };
            default: return { color: "bg-white", text: "Processing..." };
        }
    };

    const config = getStatusConfig();
    const displayMessage = message || config.text;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                    "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50",
                    "w-[300px] h-32 rounded-xl",
                    "bg-glass-md backdrop-blur-md border border-white/10 shadow-2xl",
                    "flex flex-col items-center justify-center gap-4",
                    className
                )}
            >
                {/* Shimmer Effect */}
                <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                </div>

                {/* Status Indicator */}
                <div className="relative">
                    <div className={cn(
                        "w-3 h-3 rounded-full absolute opacity-75",
                        status === "thinking" || status === "refining" ? "animate-pulse-slow" : "animate-ping",
                        config.color
                    )} />
                    <div className={cn("w-3 h-3 rounded-full relative z-10", config.color)} />
                </div>

                {/* Status Text */}
                <motion.p
                    key={status} // Animate text change
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-sm font-medium text-white/90 z-10 tracking-wide font-mono"
                >
                    {displayMessage}
                </motion.p>
            </motion.div>
        </AnimatePresence>
    );
}
