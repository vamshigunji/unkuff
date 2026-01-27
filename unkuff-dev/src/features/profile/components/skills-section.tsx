"use client";

import { useState, useCallback, useTransition, useRef, KeyboardEvent } from "react";
import { X, Loader2, Plus, Tag } from "lucide-react";
import { SectionWrapper } from "./section-wrapper";
import { SkillData } from "./profile-editor";
import { addSkill, deleteSkill } from "../actions";

interface SkillsSectionProps {
    profileId: string;
    initialData: SkillData[];
    onSaveStart: () => void;
    onSaveComplete: (success: boolean) => void;
}

export function SkillsSection({
    profileId,
    initialData,
    onSaveStart,
    onSaveComplete,
}: SkillsSectionProps) {
    const [isPending, startTransition] = useTransition();
    const [skills, setSkills] = useState<SkillData[]>(initialData);
    const [inputValue, setInputValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const handleAddSkill = useCallback(() => {
        const skillName = inputValue.trim();
        if (!skillName) return;

        startTransition(async () => {
            onSaveStart();
            const result = await addSkill(profileId, {
                name: skillName,
            });

            if (result.error) {
                onSaveComplete(false);
            } else {
                setSkills((prev) => [
                    ...prev,
                    {
                        id: result.data!.id,
                        profileId,
                        name: skillName,
                        level: null,
                        category: null,
                    },
                ]);
                setInputValue("");
                onSaveComplete(true);
                inputRef.current?.focus();
            }
        });
    }, [profileId, inputValue, onSaveStart, onSaveComplete]);

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && inputValue.trim()) {
            e.preventDefault();
            handleAddSkill();
        }
    };

    const handleDelete = useCallback(
        (id: string) => {
            startTransition(async () => {
                onSaveStart();
                const result = await deleteSkill(id);
                if (result.error) {
                    onSaveComplete(false);
                } else {
                    setSkills((prev) => prev.filter((skill) => skill.id !== id));
                    onSaveComplete(true);
                }
            });
        },
        [onSaveStart, onSaveComplete]
    );

    return (
        <SectionWrapper
            title="Skills"
            description="Your technical and professional competencies"
        >
            <div className="space-y-4">
                {/* Quick-Add Input - Always Visible */}
                <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10">
                    <div className="flex items-center gap-3">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a skill and press Enter (e.g., Python, React, Project Management)"
                            className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-active-blue/50 focus:border-active-blue/50 transition-all"
                        />
                        <button
                            onClick={handleAddSkill}
                            disabled={isPending || !inputValue.trim()}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium bg-active-blue text-white rounded-xl hover:bg-active-blue/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Plus className="h-4 w-4" />
                            )}
                            <span className="hidden sm:inline">Add</span>
                        </button>
                    </div>
                </div>

                {/* Skills Cloud */}
                {skills.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                        <Tag className="h-10 w-10 mx-auto mb-3 opacity-40" />
                        <p className="text-sm">Start typing your skills above</p>
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {skills.map((skill) => (
                            <div
                                key={skill.id}
                                className="group inline-flex items-center gap-2 px-3 pl-4 h-8 rounded-full bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] transition-all whitespace-nowrap"
                            >
                                <span className="text-sm font-medium">{skill.name}</span>
                                <button
                                    onClick={() => handleDelete(skill.id)}
                                    className="flex items-center justify-center w-5 h-5 rounded-full bg-white/[0.08] text-muted-foreground hover:bg-red-500/20 hover:text-red-400 transition-all"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                    </div>


                )}
            </div>
        </SectionWrapper>
    );
}
