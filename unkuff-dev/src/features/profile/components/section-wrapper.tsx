"use client";

import { ReactNode } from "react";

interface SectionWrapperProps {
    title: string;
    description?: string;
    children: ReactNode;
    className?: string;
    headerAction?: ReactNode;
}

export function SectionWrapper({
    title,
    description,
    children,
    className = "",
    headerAction,
}: SectionWrapperProps) {
    return (
        <div
            className={`bg-glass-md rounded-2xl p-5 relative overflow-hidden ${className}`}
        >
            {/* Inner refraction border */}
            <div className="absolute inset-[1px] rounded-[calc(1rem-1px)] border border-white/5 pointer-events-none" />

            {/* Section Header */}
            <div className="flex items-center justify-between mb-4 relative">
                <div>
                    <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
                    {description && (
                        <p className="text-sm text-muted-foreground mt-0.5">
                            {description}
                        </p>
                    )}
                </div>
                {headerAction && (
                    <div className="flex items-center gap-2">{headerAction}</div>
                )}
            </div>

            {/* Section Content */}
            <div className="relative">{children}</div>
        </div>
    );
}
