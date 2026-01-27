"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import type { ResumeData } from "../types";
import type { TemplateId } from "../templates";
import { PaperPreview } from "./paper-preview";
import { TemplateSidebar } from "./template-sidebar";
import { EmptyState } from "./empty-state";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ResumePreviewWorkspaceProps {
    initialData: ResumeData | null;
    hasProfile: boolean;
    className?: string;
}

export function ResumePreviewWorkspace({
    initialData,
    hasProfile,
    className,
}: ResumePreviewWorkspaceProps) {
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>("classic");
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleClose = () => {
        const jobId = searchParams.get('jobId');
        if (jobId) {
            router.push(`/dashboard?view=${jobId}`);
        } else {
            router.push('/dashboard');
        }
    };

    // Show empty state if no profile data
    if (!initialData || !hasProfile) {
        return (
            <EmptyState
                hasProfile={hasProfile}
                className={cn("flex-1", className)}
            />
        );
    }

    return (
        <div className={cn("flex flex-col h-full", className)}>
            {/* Action Bar */}
            <div className="flex justify-end mb-4 shrink-0">
                <Button
                    variant="ghost"
                    onClick={handleClose}
                    className="gap-2 text-muted-foreground hover:text-white bg-white/5"
                >
                    <X className="w-4 h-4" />
                    Close Editor
                </Button>
            </div>

            <div className={cn(
                // Main container
                "flex flex-col lg:flex-row gap-6 flex-1 min-h-0",
            )}>
                {/* Resume Preview (Left/Main) */}
                <div className={cn(
                    "flex-1 min-w-0", // Allow shrinking
                    "min-h-[500px] lg:min-h-0", // Mobile minimum height
                )}>
                    <PaperPreview
                        data={initialData}
                        templateId={selectedTemplate}
                        className="h-full"
                    />
                </div>

                {/* Sidebar (Right) */}
                <div className={cn(
                    "w-full lg:w-80 shrink-0",
                    "lg:max-h-full",
                )}>
                    <TemplateSidebar
                        selectedTemplate={selectedTemplate}
                        onTemplateChange={setSelectedTemplate}
                        resumeData={initialData}
                        className="h-full"
                        jobId={initialData?.jobId}
                    />
                </div>
            </div>
        </div>
    );
}
