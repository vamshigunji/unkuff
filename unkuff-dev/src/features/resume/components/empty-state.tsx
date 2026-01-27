"use client";

import { cn } from "@/lib/utils";
import { FileText, User } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
    hasProfile: boolean;
    className?: string;
}

/**
 * Empty State Component
 * 
 * Displays guidance when user doesn't have enough profile data
 * or no resume has been generated yet.
 */
export function EmptyState({ hasProfile, className }: EmptyStateProps) {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center",
            "min-h-[400px] p-8",
            "bg-glass-md rounded-2xl",
            "text-center",
            className
        )}>
            <div className="w-16 h-16 rounded-full bg-glass-sm flex items-center justify-center mb-6">
                <FileText className="w-8 h-8 text-muted-foreground" />
            </div>

            {!hasProfile ? (
                <>
                    <h2 className="text-xl font-semibold mb-2">
                        Complete Your Profile First
                    </h2>
                    <p className="text-muted-foreground max-w-md mb-6">
                        Before you can preview your resume, you&apos;ll need to add your professional
                        information. Start by filling out your profile with your experience,
                        education, and skills.
                    </p>
                    <Link
                        href="/dashboard/profile"
                        className={cn(
                            "inline-flex items-center gap-2",
                            "px-6 py-3 rounded-xl",
                            "bg-primary text-primary-foreground",
                            "font-medium",
                            "hover:opacity-90 transition-opacity",
                        )}
                    >
                        <User className="w-4 h-4" />
                        Complete Profile
                    </Link>
                </>
            ) : (
                <>
                    <h2 className="text-xl font-semibold mb-2">
                        Your Resume Preview
                    </h2>
                    <p className="text-muted-foreground max-w-md mb-6">
                        Your profile data is ready. The preview below shows how your resume
                        will appear. You can adjust your profile anytime to update the preview.
                    </p>
                    <Link
                        href="/dashboard/profile"
                        className={cn(
                            "inline-flex items-center gap-2",
                            "px-4 py-2 rounded-lg",
                            "bg-glass-sm",
                            "text-sm font-medium",
                            "hover:bg-glass-md transition-colors",
                        )}
                    >
                        <User className="w-4 h-4" />
                        Edit Profile
                    </Link>
                </>
            )}
        </div>
    );
}
