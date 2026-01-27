"use client";

import { useTailoringStream, type TailoringResult } from "../hooks/use-tailoring-stream";
import { ExplainableShimmer } from "./explainable-shimmer";
import { Button } from "@/components/ui/button";
import { Wand2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface TailorTriggerProps {
    jobId: string;
    onComplete?: (result: TailoringResult) => void;
}

export function TailorTrigger({ jobId, onComplete }: TailorTriggerProps) {
    const { status, result, startTailoring, reset } = useTailoringStream();
    const router = useRouter();

    useEffect(() => {
        if (status === "complete" && result) {
            // Wait a moment for the "Complete" animation
            const timer = setTimeout(() => {
                onComplete?.(result);
                router.refresh(); // Refresh to show new data
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [status, result, onComplete, router]);

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
        <div className="relative inline-block">
            {status === "idle" ? (
                <Button
                    onClick={handleClick}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
                >
                    <Wand2 className="w-4 h-4 mr-2" />
                    Tailor Resume
                </Button>
            ) : (
                <Button disabled className="bg-glass-md text-white/50 border border-white/10">
                    <Wand2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
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
