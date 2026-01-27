"use client";

import { useState, useCallback, useEffect, useTransition } from "react";
import { SectionWrapper } from "./section-wrapper";
import { ProfileData } from "./profile-editor";
import { saveProfile, updateBioEmbedding } from "../actions";

interface SummarySectionProps {
    userId: string;
    initialData: ProfileData | null;
    onSaveStart: () => void;
    onSaveComplete: (success: boolean) => void;
}

export function SummarySection({
    userId,
    initialData,
    onSaveStart,
    onSaveComplete,
}: SummarySectionProps) {
    const [isPending, startTransition] = useTransition();

    const [formData, setFormData] = useState({
        summary: initialData?.summary || "",
    });

    const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);

    const handleChange = useCallback(
        (field: keyof typeof formData, value: string) => {
            setFormData((prev) => ({ ...prev, [field]: value }));

            if (saveTimeout) {
                clearTimeout(saveTimeout);
            }

            const timeout = setTimeout(() => {
                startTransition(async () => {
                    onSaveStart();
                    const result = await saveProfile({
                        ...formData,
                        [field]: value,
                    });

                    if (result.error) {
                        onSaveComplete(false);
                    } else {
                        onSaveComplete(true);
                        updateBioEmbedding(userId).catch(console.error);
                    }
                });
            }, 300);

            setSaveTimeout(timeout);
        },
        [formData, saveTimeout, onSaveStart, onSaveComplete, userId]
    );

    useEffect(() => {
        return () => {
            if (saveTimeout) {
                clearTimeout(saveTimeout);
            }
        };
    }, [saveTimeout]);

    return (
        <div className="space-y-6">
            {/* Professional Summary */}
            <SectionWrapper
                title="Professional Summary"
                description="A compelling overview of your professional background, key achievements, and career goals"
            >
                <div className="space-y-4">
                    <textarea
                        value={formData.summary}
                        onChange={(e) => handleChange("summary", e.target.value)}
                        rows={8}
                        placeholder="Staff-level Data Scientist with 8+ years of experience in Data Science, Advanced Analytics, and AI Engineering. Proven ability to translate ambiguous business problems into scalable metrics, models, and self-service analytics systems.

Key highlights:
• Built AI-powered analytics agents enabling natural language data querying
• Developed findability scoring models achieving ~0.93 AUC and ~90% accuracy
• Created self-service analytics platforms reducing insight turnaround from 1 week to 1 day
• Influenced design decisions contributing to ~30% improvement in user satisfaction"
                        className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-active-blue/50 focus:border-active-blue/50 transition-all resize-none"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground/60">
                        <span>{formData.summary.length} characters</span>
                        <span>Recommended: 400-800 characters</span>
                    </div>
                </div>
            </SectionWrapper>
        </div>
    );
}
