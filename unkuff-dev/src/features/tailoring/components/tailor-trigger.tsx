"use client";

import { useTailoringStream, type TailoringResult } from "../hooks/use-tailoring-stream";
import { ExplainableShimmer } from "./explainable-shimmer";
import { Button } from "@/components/ui/button";
import { Wand2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TailorTriggerProps {
    jobId: string;
    onComplete?: (result: TailoringResult) => void;
    className?: string;
    variant?: "primary" | "secondary";
    label?: string;
}

export function TailorTrigger({ jobId, onComplete, className, variant = "primary", label = "Tailor Resume" }: TailorTriggerProps) {
    const { status, result, error, startTailoring, reset } = useTailoringStream();
    const router = useRouter();

    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => {
        if (status === "complete" && result && !isNavigating) {
            setIsNavigating(true);
            // Wait a moment for the "Complete" animation
            const timer = setTimeout(() => {
                onComplete?.(result);
                
                // If variant is secondary (Dashboard Trigger), do NOT navigate automatically
                // If variant is primary (Direct Ingress), navigate to editor
                if (variant === "primary") {
                    const url = `/dashboard/resumes?jobId=${jobId}`;
                    console.log("[TailorTrigger] Auto-navigating to:", url);
                    window.location.assign(url);
                } else {
                    console.log("[TailorTrigger] Background tailoring complete, staying on dashboard.");
                    setIsNavigating(false);
                    reset();
                }
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [status, result, onComplete, isNavigating, jobId, variant, reset]);

    const handleClick = () => {
        startTailoring(jobId);
    };

    const handleRetry = () => {
        reset();
        startTailoring(jobId);
    };

    const handleDismissError = () => {
        reset();
    };

    // Error state with retry option
    if (status === "error") {
        return (
            <div className="flex flex-col gap-2">
                <div className="text-[10px] text-red-400 font-mono bg-red-400/10 p-2 rounded-lg border border-red-400/20 max-w-[200px] break-words">
                    Error: {error || "Unknown failure"}
                </div>
                <div className="relative inline-flex gap-2">
                    <Button
                        onClick={handleRetry}
                        className="bg-red-600 hover:bg-red-700 text-white h-9 px-4"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Retry
                    </Button>
                    <Button
                        onClick={handleDismissError}
                        variant="outline"
                        className="border-white/20 text-white/70 hover:text-white h-9 px-4"
                    >
                        Dismiss
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("relative inline-block", className)}>
            {status === "idle" ? (
                <Button
                    onClick={handleClick}
                    className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-lg shadow-blue-500/20 font-bold px-6 h-11 rounded-xl"
                >
                    <Wand2 className="w-4 h-4 mr-2" />
                    {label}
                </Button>
            ) : (
                <Button disabled className="bg-white/10 text-white/50 border border-white/10 h-11 px-6 rounded-xl">
                    <Wand2 className="w-4 h-4 mr-2 animate-spin" />
                    {status === "complete" ? "Redirecting..." : "Processing..."}
                </Button>
            )}

            {/* The Shimmer Overlay */}
            {status !== "idle" && (
                <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center">
                    <ExplainableShimmer status={status} />
                </div>
            )}
        </div>
    );
}
