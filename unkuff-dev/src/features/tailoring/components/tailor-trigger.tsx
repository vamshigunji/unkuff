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
}

export function TailorTrigger({ jobId, onComplete, className }: TailorTriggerProps) {
    const { status, result, startTailoring, reset } = useTailoringStream();
    const router = useRouter();

    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => {
        if (status === "complete" && result && !isNavigating) {
            setIsNavigating(true);
            // Wait a moment for the "Complete" animation
            const timer = setTimeout(() => {
                onComplete?.(result);
                // Story [UI-03]: Navigate to editor on completion
                const url = `/dashboard/resumes?jobId=${jobId}`;
                console.log("[TailorTrigger] Final navigation to:", url);
                
                // Close modal by trigger if possible or hard navigate
                window.location.assign(url);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [status, result, onComplete, isNavigating, jobId]);

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
            <div className="relative inline-flex gap-2">
                <Button
                    onClick={handleRetry}
                    className="bg-red-600 hover:bg-red-700 text-white"
                >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry
                </Button>
                <Button
                    onClick={handleDismissError}
                    variant="outline"
                    className="border-white/20 text-white/70 hover:text-white"
                >
                    Dismiss
                </Button>
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
                    Tailor Resume
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
