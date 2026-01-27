"use client";

/**
 * Export Button Component
 * 
 * A glass-styled button for PDF/DOCX export with:
 * - Loading states with shimmer animation
 * - Processing phase text updates
 * - Success state with Truth Pulse animation
 * - Disabled state during processing
 */

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { FileText, FileType2, Loader2, Check } from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

export type ExportFormat = "pdf" | "docx";
export type ExportPhase = "idle" | "preparing" | "formatting" | "complete" | "error";

interface ExportButtonProps {
    format: ExportFormat;
    onExport: () => Promise<void>;
    disabled?: boolean;
    className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ExportButton({
    format,
    onExport,
    disabled = false,
    className,
}: ExportButtonProps) {
    const [phase, setPhase] = useState<ExportPhase>("idle");

    const isPdf = format === "pdf";
    const Icon = isPdf ? FileText : FileType2;
    const label = isPdf ? "Download PDF" : "Download DOCX";

    // Phase-specific status text
    const statusText: Record<ExportPhase, string> = {
        idle: label,
        preparing: isPdf ? "Preparing PDF..." : "Preparing DOCX...",
        formatting: "Formatting assets...",
        complete: "Complete ✓",
        error: "Failed - Try again",
    };

    const isLoading = phase === "preparing" || phase === "formatting";
    const isComplete = phase === "complete";
    const isError = phase === "error";

    const handleClick = useCallback(async () => {
        if (isLoading || disabled) return;

        let phaseTimer: NodeJS.Timeout | null = null;

        try {
            setPhase("preparing");

            // Simulate phases for UX feedback
            phaseTimer = setTimeout(() => {
                setPhase("formatting");
            }, 500);

            await onExport();

            setPhase("complete");

            // Return to idle after success animation
            setTimeout(() => {
                setPhase("idle");
            }, 2000);
        } catch (error) {
            setPhase("error");

            // Return to idle after error display
            setTimeout(() => {
                setPhase("idle");
            }, 3000);
        } finally {
            // Always clear the phase timer to prevent race conditions
            if (phaseTimer) {
                clearTimeout(phaseTimer);
            }
        }
    }, [onExport, isLoading, disabled]);

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={disabled || isLoading}
            className={cn(
                // Base styles - Glass effect
                "relative w-full flex items-center justify-center gap-2",
                "px-4 py-3 rounded-lg",
                "bg-white/5 backdrop-blur-sm",
                "border border-white/10",
                "text-sm font-medium",
                "transition-all duration-200",

                // Idle state
                phase === "idle" && !disabled && [
                    "text-white/90",
                    "hover:bg-white/10",
                    "hover:border-white/20",
                    "hover:scale-[1.02]",
                    "active:scale-[0.98]",
                ],

                // Loading state - Shimmer animation
                isLoading && [
                    "text-white/70",
                    "cursor-wait",
                    "animate-pulse",
                ],

                // Complete state - Truth Pulse (emerald)
                isComplete && [
                    "text-emerald-400",
                    "border-emerald-400/30",
                    "bg-emerald-400/10",
                    "animate-[pulse_0.5s_ease-in-out_2]",
                ],

                // Error state
                isError && [
                    "text-red-400",
                    "border-red-400/30",
                    "bg-red-400/10",
                ],

                // Disabled state
                disabled && [
                    "opacity-50",
                    "cursor-not-allowed",
                ],

                className
            )}
            aria-busy={isLoading}
            aria-label={statusText[phase]}
        >
            {/* Shimmer overlay for loading state */}
            {isLoading && (
                <div
                    className={cn(
                        "absolute inset-0 rounded-lg overflow-hidden",
                        "pointer-events-none"
                    )}
                    aria-hidden="true"
                >
                    <div
                        className={cn(
                            "absolute inset-0 -translate-x-full",
                            "bg-gradient-to-r from-transparent via-white/10 to-transparent",
                            "animate-[shimmer_1.5s_infinite]"
                        )}
                    />
                </div>
            )}

            {/* Icon */}
            {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : isComplete ? (
                <Check className="w-4 h-4" aria-hidden="true" />
            ) : (
                <Icon className="w-4 h-4" aria-hidden="true" />
            )}

            {/* Status Text */}
            <span>{statusText[phase]}</span>
        </button>
    );
}

// ============================================================================
// SHIMMER KEYFRAMES (Add to globals.css if not present)
// ============================================================================

/**
 * Add this to globals.css:
 * 
 * @keyframes shimmer {
 *   100% {
 *     transform: translateX(100%);
 *   }
 * }
 */
