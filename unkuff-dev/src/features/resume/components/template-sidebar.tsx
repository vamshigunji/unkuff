"use client";

import { cn } from "@/lib/utils";
import { TEMPLATES, type TemplateId } from "../templates";
import type { ResumeData } from "../types";
import {
    FileText,
    Sparkles,
    Minimize2,
    Crown,
    LayoutList,
    Check
} from "lucide-react";
import Link from "next/link";
import { ExportSection } from "./export-section";
import { TailorTrigger } from "@/features/tailoring/components/tailor-trigger";


interface TemplateSidebarProps {
    selectedTemplate: TemplateId;
    onTemplateChange?: (templateId: TemplateId) => void;
    resumeData?: ResumeData | null;
    className?: string;
    jobId?: string;
}


// Icon mapping for each template
const TEMPLATE_ICONS = {
    classic: FileText,
    modern: Sparkles,
    minimalist: Minimize2,
    executive: Crown,
    compact: LayoutList,
} as const;

/**
 * Template Sidebar Component
 * 
 * Right panel showing template selection options and export controls.
 * Features:
 * - 5 ATS-friendly template options
 * - Visual preview of each template style
 * - "Best for" industry recommendations
 * - Export to PDF/DOCX with progress feedback
 * - Quick actions (Edit Profile)
 */
export function TemplateSidebar({
    selectedTemplate,
    onTemplateChange,
    resumeData,
    className,
    jobId
}: TemplateSidebarProps) {
    const currentTemplate = TEMPLATES[selectedTemplate] || TEMPLATES.classic;

    return (
        <div className={cn(
            "bg-glass-md rounded-2xl p-6",
            "flex flex-col gap-6",
            "overflow-y-auto",
            className
        )}>
            {/* Template Library */}
            <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    Template Library
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                    All templates are ATS-friendly with no graphics
                </p>

                <div className="space-y-2">
                    {(Object.entries(TEMPLATES) as [TemplateId, typeof TEMPLATES[TemplateId]][]).map(([id, template]) => {
                        const Icon = TEMPLATE_ICONS[id];
                        const isSelected = selectedTemplate === id;

                        return (
                            <button
                                key={id}
                                onClick={() => onTemplateChange?.(id)}
                                className={cn(
                                    "w-full text-left p-3 rounded-xl transition-all",
                                    "border border-transparent",
                                    "group relative",
                                    isSelected
                                        ? "bg-active-blue/20 border-active-blue/50"
                                        : "bg-glass-sm hover:bg-white/10"
                                )}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={cn(
                                        "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                                        isSelected
                                            ? "bg-active-blue/30 text-active-blue"
                                            : "bg-white/10 text-muted-foreground group-hover:bg-white/20"
                                    )}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className={cn(
                                                "font-medium text-sm",
                                                isSelected && "text-active-blue"
                                            )}>
                                                {template.name}
                                            </span>
                                            {isSelected && (
                                                <Check className="w-3.5 h-3.5 text-active-blue" />
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                            {template.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Best For Tag */}
                                <div className="mt-2 ml-12">
                                    <span className={cn(
                                        "text-[10px] px-2 py-0.5 rounded-full",
                                        isSelected
                                            ? "bg-active-blue/20 text-active-blue"
                                            : "bg-white/10 text-muted-foreground"
                                    )}>
                                        Best for: {template.bestFor}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Current Template Summary */}
            <div className="p-4 bg-glass-sm rounded-xl">
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Selected Template
                </h4>
                <p className="font-medium text-sm">{currentTemplate.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                    {currentTemplate.preview}
                </p>
            </div>

            {/* Export Section - Story 4.4 */}
            {resumeData && (
                <ExportSection
                    resumeData={resumeData}
                    templateId={selectedTemplate}
                />
            )}

            {/* Quick Actions */}
            <div className="mt-auto space-y-3">
                {(jobId || resumeData?.jobId) && (
                    <div className="w-full flex justify-center pb-2 border-b border-white/10">
                        <TailorTrigger jobId={jobId || resumeData?.jobId!} />
                    </div>
                )}
                <Link

                    href="/dashboard/profile"
                    className={cn(
                        "flex items-center justify-center gap-2 w-full",
                        "px-4 py-3 rounded-xl",
                        "bg-glass-sm",
                        "font-medium text-sm",
                        "hover:bg-glass-md transition-colors",
                    )}
                >
                    Edit Profile Data
                </Link>
            </div>
        </div>
    );
}
