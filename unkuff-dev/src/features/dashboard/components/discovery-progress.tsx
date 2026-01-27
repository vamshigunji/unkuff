"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress"; // Assuming a ShadCN Progress component
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils"; // For tailwind-merge equivalent

interface DiscoveryProgressData {
    status: "in_progress" | "completed" | "failed";
    currentStep: number;
    totalSteps: number;
    percentage: number;
    message?: string;
}

export function DiscoveryProgress() {
    const [progress, setProgress] = useState<DiscoveryProgressData | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const response = await fetch("/api/discovery-progress");
                if (response.ok) {
                    const data: DiscoveryProgressData = await response.json();
                    setProgress(data);
                    if (data.status === "in_progress") {
                        setIsVisible(true);
                    } else {
                        // Keep visible for a short period after completion/failure
                        setTimeout(() => setIsVisible(false), 3000); 
                    }
                } else if (response.status === 404) {
                    // No progress found, likely not running
                    setIsVisible(false);
                } else {
                    console.error("Failed to fetch discovery progress:", response.statusText);
                    setIsVisible(false);
                }
            } catch (error) {
                console.error("Error fetching discovery progress:", error);
                setIsVisible(false);
            }
        };

        // Fetch immediately and then every few seconds
        fetchProgress();
        const interval = setInterval(fetchProgress, 5000); // Poll every 5 seconds

        return () => clearInterval(interval);
    }, []);

    if (!isVisible || !progress) {
        return null;
    }

    const progressColor = progress.status === "failed" ? "bg-red-500" : "bg-active-blue";

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="fixed top-4 right-4 z-50 p-3 rounded-lg shadow-lg backdrop-blur-xl bg-white/[0.05] border border-white/[0.1] text-sm text-foreground/80 max-w-xs w-full"
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-white">Discovery Progress</span>
                        <span className={cn("font-bold", {
                            "text-red-400": progress.status === "failed",
                            "text-green-400": progress.status === "completed",
                        })}>
                            {progress.percentage}%
                        </span>
                    </div>
                    <Progress value={progress.percentage} className="w-full h-2 bg-white/[0.1]" />
                    {progress.message && (
                        <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                            {progress.message}
                        </p>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
