"use client";

import { cn } from "@/lib/utils";
import type { ResumeData } from "../types";
import {
    ClassicTemplate,
    ModernTemplate,
    MinimalistTemplate,
    ExecutiveTemplate,
    CompactTemplate
} from "../templates";
import type { TemplateId } from "../templates";

interface PaperPreviewProps {
    data: ResumeData;
    templateId?: TemplateId;
    className?: string;
}

/**
 * Paper Preview Component
 * 
 * Renders a resume template inside a "paper document" visual abstraction.
 * Features:
 * - White paper background with shadow
 * - Glass container with custom scrollbar
 * - Responsive scaling for different viewports
 * - Dynamic template switching
 */
export function PaperPreview({ data, templateId = "classic", className }: PaperPreviewProps) {
    // Render the appropriate template based on templateId
    const renderTemplate = () => {
        switch (templateId) {
            case "modern":
                return <ModernTemplate data={data} />;
            case "minimalist":
                return <MinimalistTemplate data={data} />;
            case "executive":
                return <ExecutiveTemplate data={data} />;
            case "compact":
                return <CompactTemplate data={data} />;
            case "classic":
            default:
                return <ClassicTemplate data={data} />;
        }
    };

    return (
        <div className={cn(
            // Glass container
            "bg-glass-md rounded-2xl p-6",
            // Scrollable container
            "overflow-y-auto overflow-x-hidden",
            // Custom scrollbar (from globals.css)
            "scrollbar-thin",
            className
        )}>
            {/* Paper document abstraction */}
            <div className={cn(
                // Paper styling
                "mx-auto",
                "bg-white",
                "rounded shadow-xl",
                // A4 aspect ratio approximation
                "max-w-[800px]",
                // Scale for viewport
                "transform-gpu origin-top",
            )}>
                {/* Render the selected template */}
                {renderTemplate()}
            </div>
        </div>
    );
}
