"use client";

/**
 * Export Section Component
 * 
 * Container for PDF and DOCX export buttons with:
 * - Glass-styled section header
 * - Truth Pulse success animation
 * - Toast notifications for success/error
 * - Responsive layout
 */

import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { ExportButton, type ExportFormat } from "./export-button";
import type { ResumeData } from "../types";
import type { TemplateId } from "../templates";
import { generatePdf, generateDocx } from "../export-actions";

// ============================================================================
// TYPES
// ============================================================================

interface ExportSectionProps {
    resumeData: ResumeData;
    templateId: TemplateId;
    className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ExportSection({
    resumeData,
    templateId,
    className,
}: ExportSectionProps) {
    const [showSuccess, setShowSuccess] = useState(false);

    /**
     * Handle export and trigger file download.
     */
    const handleExport = useCallback(async (format: ExportFormat) => {
        const formatLabel = format.toUpperCase();

        try {
            // Call server action based on format
            const result = format === "pdf"
                ? await generatePdf(resumeData, templateId)
                : await generateDocx(resumeData, templateId);

            if (result.error || !result.data) {
                // Show error toast
                toast.error(`${formatLabel} Export Failed`, {
                    description: result.error || "An unexpected error occurred. Please try again.",
                });
                throw new Error(result.error || "Export failed");
            }

            // Convert base64 to blob and trigger download
            const byteCharacters = atob(result.data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);

            const mimeType = format === "pdf"
                ? "application/pdf"
                : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

            const blob = new Blob([byteArray], { type: mimeType });
            const url = URL.createObjectURL(blob);

            // Generate filename
            const sanitizedName = resumeData.contact.fullName
                .toLowerCase()
                .replace(/[^a-z0-9]/g, "-")
                .replace(/-+/g, "-")
                .replace(/^-|-$/g, "") || "resume";
            const filename = `${sanitizedName}-${templateId}.${format}`;

            // Trigger download
            const link = document.createElement("a");
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Cleanup
            setTimeout(() => URL.revokeObjectURL(url), 100);

            // Show success toast
            toast.success(`${formatLabel} Downloaded`, {
                description: `Your resume has been saved as ${filename}`,
            });

            // Show success state briefly
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
        } catch (error) {
            // Log error for debugging
            console.error(`${formatLabel} export error:`, error);

            // Show error toast if not already shown
            if (!(error instanceof Error && error.message === "Export failed")) {
                toast.error(`${formatLabel} Export Failed`, {
                    description: "An unexpected error occurred. Please try again.",
                });
            }
            throw error; // Re-throw for ExportButton to handle state
        }
    }, [resumeData, templateId]);

    const handlePdfExport = useCallback(() => handleExport("pdf"), [handleExport]);
    const handleDocxExport = useCallback(() => handleExport("docx"), [handleExport]);

    return (
        <div
            className={cn(
                // Container styling - glass effect
                "rounded-xl overflow-hidden",
                "bg-white/5 backdrop-blur-sm",
                "border border-white/10",
                // Success animation
                showSuccess && "animate-truth-pulse",
                className
            )}
        >
            {/* Section Header */}
            <div className={cn(
                "flex items-center gap-2 px-4 py-3",
                "border-b border-white/10",
                "text-sm font-medium text-white/80"
            )}>
                <Download className="w-4 h-4" aria-hidden="true" />
                <span>Export Resume</span>
            </div>

            {/* Export Buttons */}
            <div className="p-4 space-y-3">
                <ExportButton
                    format="pdf"
                    onExport={handlePdfExport}
                />
                <ExportButton
                    format="docx"
                    onExport={handleDocxExport}
                />

                {/* Help Text */}
                <p className="text-xs text-white/50 text-center pt-2">
                    ATS-optimized formats for job applications
                </p>
            </div>
        </div>
    );
}
