"use client";

import { useState, useCallback, useTransition } from "react";
import { Plus, Trash2, GraduationCap, Calendar, MapPin, Loader2 } from "lucide-react";
import { SectionWrapper } from "./section-wrapper";
import { EducationData } from "./profile-editor";
import { addEducation, updateEducation, deleteEducation } from "../actions";

interface EducationSectionProps {
    profileId: string;
    initialData: EducationData[];
    onSaveStart: () => void;
    onSaveComplete: (success: boolean) => void;
}

interface EducationFormData {
    institution: string;
    degree: string;
    fieldOfStudy: string;
    location: string;
    startDate: string;
    endDate: string;
}

const emptyForm: EducationFormData = {
    institution: "",
    degree: "",
    fieldOfStudy: "",
    location: "",
    startDate: "",
    endDate: "",
};

export function EducationSection({
    profileId,
    initialData,
    onSaveStart,
    onSaveComplete,
}: EducationSectionProps) {
    const [isPending, startTransition] = useTransition();
    const [educations, setEducations] = useState<EducationData[]>(initialData);
    const [editingId, setEditingId] = useState<string | null>(null);
    // Show form by default if no education entries exist
    const [isAdding, setIsAdding] = useState(initialData.length === 0);
    const [formData, setFormData] = useState<EducationFormData>(emptyForm);

    const formatDateForInput = (date: Date | null) => {
        if (!date) return "";
        return new Date(date).toISOString().split("T")[0];
    };

    const handleEdit = (edu: EducationData) => {
        setEditingId(edu.id);
        setIsAdding(false);
        setFormData({
            institution: edu.institution,
            degree: edu.degree || "",
            fieldOfStudy: edu.fieldOfStudy || "",
            location: edu.location || "",
            startDate: formatDateForInput(edu.startDate),
            endDate: formatDateForInput(edu.endDate),
        });
    };

    const handleAddAnother = () => {
        setIsAdding(true);
        setEditingId(null);
        setFormData(emptyForm);
    };

    const handleCancel = () => {
        if (educations.length > 0) {
            setEditingId(null);
            setIsAdding(false);
        }
        setFormData(emptyForm);
    };

    const handleSave = useCallback(() => {
        if (!formData.institution) return;

        startTransition(async () => {
            onSaveStart();

            if (isAdding || !editingId) {
                const result = await addEducation(profileId, formData);
                if (result.error) {
                    onSaveComplete(false);
                } else {
                    setEducations((prev) => [
                        {
                            id: result.data!.id,
                            profileId,
                            institution: formData.institution,
                            degree: formData.degree || null,
                            fieldOfStudy: formData.fieldOfStudy || null,
                            location: formData.location || null,
                            startDate: formData.startDate ? new Date(formData.startDate) : null,
                            endDate: formData.endDate ? new Date(formData.endDate) : null,
                        },
                        ...prev,
                    ]);
                    onSaveComplete(true);
                    setFormData(emptyForm);
                    setIsAdding(false);
                }
            } else if (editingId) {
                const result = await updateEducation(editingId, formData);
                if (result.error) {
                    onSaveComplete(false);
                } else {
                    setEducations((prev) =>
                        prev.map((edu) =>
                            edu.id === editingId
                                ? {
                                    ...edu,
                                    institution: formData.institution,
                                    degree: formData.degree || null,
                                    fieldOfStudy: formData.fieldOfStudy || null,
                                    location: formData.location || null,
                                    startDate: formData.startDate ? new Date(formData.startDate) : null,
                                    endDate: formData.endDate ? new Date(formData.endDate) : null,
                                }
                                : edu
                        )
                    );
                    onSaveComplete(true);
                    setEditingId(null);
                    setFormData(emptyForm);
                }
            }
        });
    }, [isAdding, editingId, profileId, formData, onSaveStart, onSaveComplete]);

    const handleDelete = useCallback(
        (id: string) => {
            startTransition(async () => {
                onSaveStart();
                const result = await deleteEducation(id);
                if (result.error) {
                    onSaveComplete(false);
                } else {
                    setEducations((prev) => {
                        const newList = prev.filter((edu) => edu.id !== id);
                        if (newList.length === 0) {
                            setIsAdding(true);
                        }
                        return newList;
                    });
                    onSaveComplete(true);
                }
            });
        },
        [onSaveStart, onSaveComplete]
    );

    const updateField = (field: keyof EducationFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <SectionWrapper
            title="Education"
            description="Your academic background and qualifications"
            headerAction={
                educations.length > 0 && !isAdding && !editingId && (
                    <button
                        onClick={handleAddAnother}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-active-blue hover:text-active-blue/80 bg-active-blue/10 hover:bg-active-blue/20 rounded-lg transition-all"
                    >
                        <Plus className="h-4 w-4" />
                        Add Another
                    </button>
                )
            }
        >
            <div className="space-y-4">
                {/* Form - Shown by default when empty */}
                {(isAdding || editingId) && (
                    <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Institution *</label>
                                <input
                                    type="text"
                                    value={formData.institution}
                                    onChange={(e) => updateField("institution", e.target.value)}
                                    placeholder="Stanford University"
                                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-active-blue/50 focus:border-active-blue/50 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Degree</label>
                                <input
                                    type="text"
                                    value={formData.degree}
                                    onChange={(e) => updateField("degree", e.target.value)}
                                    placeholder="Bachelor of Science"
                                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-active-blue/50 focus:border-active-blue/50 transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Field of Study</label>
                                <input
                                    type="text"
                                    value={formData.fieldOfStudy}
                                    onChange={(e) => updateField("fieldOfStudy", e.target.value)}
                                    placeholder="Computer Science"
                                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-active-blue/50 focus:border-active-blue/50 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Location</label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => updateField("location", e.target.value)}
                                    placeholder="Palo Alto, CA"
                                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-active-blue/50 focus:border-active-blue/50 transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                                <input
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => updateField("startDate", e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-foreground focus:outline-none focus:ring-2 focus:ring-active-blue/50 focus:border-active-blue/50 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">End Date (or Expected)</label>
                                <input
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => updateField("endDate", e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-foreground focus:outline-none focus:ring-2 focus:ring-active-blue/50 focus:border-active-blue/50 transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2">
                            {educations.length > 0 && (
                                <button
                                    onClick={handleCancel}
                                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                onClick={handleSave}
                                disabled={isPending || !formData.institution}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-active-blue text-white rounded-lg hover:bg-active-blue/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                                {isPending ? "Saving..." : editingId ? "Save Changes" : "Add Education"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Education List */}
                {educations.map((edu) =>
                    editingId === edu.id ? null : (
                        <div
                            key={edu.id}
                            className="p-4 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.06] transition-all group"
                        >
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <h3 className="font-semibold text-foreground">
                                        {edu.degree || "Degree"}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <GraduationCap className="h-4 w-4" />
                                        <span>{edu.institution}</span>
                                        {edu.location && (
                                            <>
                                                <span className="text-muted-foreground/40">•</span>
                                                <MapPin className="h-4 w-4" />
                                                <span>{edu.location}</span>
                                            </>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span>
                                            {edu.startDate
                                                ? new Date(edu.startDate).getFullYear()
                                                : "Unknown"}{" "}
                                            -{" "}
                                            {edu.endDate
                                                ? new Date(edu.endDate).getFullYear()
                                                : "Present"}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleEdit(edu)}
                                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-white/10 rounded-lg transition-all"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(edu.id)}
                                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                )}
            </div>
        </SectionWrapper>
    );
}
