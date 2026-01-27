"use client";

import { useState, useCallback, useTransition } from "react";
import { Plus, Trash2, Building2, Calendar, MapPin, Loader2 } from "lucide-react";
import { SectionWrapper } from "./section-wrapper";
import { WorkExperienceData } from "./profile-editor";
import { addWorkExperience, updateWorkExperience, deleteWorkExperience } from "../actions";

interface WorkExperienceSectionProps {
    profileId: string;
    initialData: WorkExperienceData[];
    onSaveStart: () => void;
    onSaveComplete: (success: boolean) => void;
}

interface ExperienceFormData {
    company: string;
    title: string;
    description: string;
    accomplishments: string[];
    location: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
}

const emptyForm: ExperienceFormData = {
    company: "",
    title: "",
    description: "",
    accomplishments: [],
    location: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
};

export function WorkExperienceSection({
    profileId,
    initialData,
    onSaveStart,
    onSaveComplete,
}: WorkExperienceSectionProps) {
    const [isPending, startTransition] = useTransition();
    const [experiences, setExperiences] = useState<WorkExperienceData[]>(initialData);
    const [editingId, setEditingId] = useState<string | null>(null);
    // Show form by default if no experiences exist
    const [isAdding, setIsAdding] = useState(initialData.length === 0);
    const [formData, setFormData] = useState<ExperienceFormData>(emptyForm);

    const formatDateForInput = (date: Date | null) => {
        if (!date) return "";
        return new Date(date).toISOString().split("T")[0];
    };

    const handleEdit = (exp: WorkExperienceData) => {
        setEditingId(exp.id);
        setIsAdding(false);
        setFormData({
            company: exp.company,
            title: exp.title,
            description: exp.description || "",
            accomplishments: exp.accomplishments || [],
            location: exp.location || "",
            startDate: formatDateForInput(exp.startDate),
            endDate: formatDateForInput(exp.endDate),
            isCurrent: exp.isCurrent === "true",
        });
    };

    const handleAddAnother = () => {
        setIsAdding(true);
        setEditingId(null);
        setFormData(emptyForm);
    };

    const handleCancel = () => {
        // Only hide form if there are existing experiences
        if (experiences.length > 0) {
            setEditingId(null);
            setIsAdding(false);
        }
        setFormData(emptyForm);
    };

    const handleSave = useCallback(() => {
        if (!formData.company || !formData.title) return;

        // Clean up accomplishments - filter empty lines and trim whitespace
        const cleanedAccomplishments = formData.accomplishments
            .map(a => a.trim())
            .filter(a => a.length > 0);

        const dataToSave = {
            ...formData,
            accomplishments: cleanedAccomplishments,
        };

        startTransition(async () => {
            onSaveStart();

            if (isAdding || !editingId) {
                const result = await addWorkExperience(profileId, dataToSave);
                if (result.error) {
                    onSaveComplete(false);
                } else {
                    setExperiences((prev) => [
                        {
                            id: result.data!.id,
                            profileId,
                            company: dataToSave.company,
                            title: dataToSave.title,
                            description: dataToSave.description || null,
                            accomplishments: cleanedAccomplishments.length > 0 ? cleanedAccomplishments : null,
                            location: dataToSave.location || null,
                            startDate: dataToSave.startDate ? new Date(dataToSave.startDate) : null,
                            endDate: dataToSave.endDate ? new Date(dataToSave.endDate) : null,
                            isCurrent: dataToSave.isCurrent ? "true" : "false",
                        },
                        ...prev,
                    ]);
                    onSaveComplete(true);
                    setFormData(emptyForm);
                    setIsAdding(false);
                }
            } else if (editingId) {
                const result = await updateWorkExperience(editingId, dataToSave);
                if (result.error) {
                    onSaveComplete(false);
                } else {
                    setExperiences((prev) =>
                        prev.map((exp) =>
                            exp.id === editingId
                                ? {
                                    ...exp,
                                    company: dataToSave.company,
                                    title: dataToSave.title,
                                    description: dataToSave.description || null,
                                    accomplishments: cleanedAccomplishments.length > 0 ? cleanedAccomplishments : null,
                                    location: dataToSave.location || null,
                                    startDate: dataToSave.startDate ? new Date(dataToSave.startDate) : null,
                                    endDate: dataToSave.endDate ? new Date(dataToSave.endDate) : null,
                                    isCurrent: dataToSave.isCurrent ? "true" : "false",
                                }
                                : exp
                        )
                    );
                    onSaveComplete(true);
                    setEditingId(null);
                    setFormData(emptyForm);
                }
            }
        });
    }, [isAdding, editingId, profileId, formData, onSaveStart, onSaveComplete, experiences.length]);

    const handleDelete = useCallback(
        (id: string) => {
            startTransition(async () => {
                onSaveStart();
                const result = await deleteWorkExperience(id);
                if (result.error) {
                    onSaveComplete(false);
                } else {
                    setExperiences((prev) => {
                        const newList = prev.filter((exp) => exp.id !== id);
                        // Show form if no experiences left
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

    const updateField = (field: keyof ExperienceFormData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <SectionWrapper
            title="Work Experience"
            description="Your professional history and accomplishments"
            headerAction={
                experiences.length > 0 && !isAdding && !editingId && (
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
                {/* Form - Shown by default when empty or when adding/editing */}
                {(isAdding || editingId) && (
                    <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Company *</label>
                                <input
                                    type="text"
                                    value={formData.company}
                                    onChange={(e) => updateField("company", e.target.value)}
                                    placeholder="Acme Corp"
                                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-active-blue/50 focus:border-active-blue/50 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Job Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => updateField("title", e.target.value)}
                                    placeholder="Senior Software Engineer"
                                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-active-blue/50 focus:border-active-blue/50 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Location</label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => updateField("location", e.target.value)}
                                placeholder="San Francisco, CA (Remote)"
                                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-active-blue/50 focus:border-active-blue/50 transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                <label className="text-sm font-medium text-muted-foreground">End Date</label>
                                <input
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => updateField("endDate", e.target.value)}
                                    disabled={formData.isCurrent}
                                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-foreground focus:outline-none focus:ring-2 focus:ring-active-blue/50 focus:border-active-blue/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">&nbsp;</label>
                                <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isCurrent}
                                        onChange={(e) => {
                                            updateField("isCurrent", e.target.checked);
                                            if (e.target.checked) updateField("endDate", "");
                                        }}
                                        className="rounded"
                                    />
                                    <span className="text-sm">Current role</span>
                                </label>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => updateField("description", e.target.value)}
                                rows={2}
                                placeholder="Brief summary of your role scope..."
                                className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-active-blue/50 focus:border-active-blue/50 transition-all resize-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                                Accomplishments & Achievements
                                <span className="text-xs text-muted-foreground/60 ml-2">(one per line)</span>
                            </label>
                            <textarea
                                value={formData.accomplishments.join("\n")}
                                onChange={(e) => updateField("accomplishments", e.target.value.split("\n"))}
                                rows={5}
                                placeholder="Led a team of 5 engineers to deliver...&#10;Increased conversion rate by 25%...&#10;Built scalable microservices architecture..."
                                className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-active-blue/50 focus:border-active-blue/50 transition-all resize-none font-mono text-sm"
                            />
                            <p className="text-xs text-muted-foreground/60">
                                These bullet points will be used for AI tailoring and resume generation.
                            </p>
                        </div>

                        <div className="flex items-center justify-end gap-2">
                            {experiences.length > 0 && (
                                <button
                                    onClick={handleCancel}
                                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                onClick={handleSave}
                                disabled={isPending || !formData.company || !formData.title}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-active-blue text-white rounded-lg hover:bg-active-blue/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                                {isPending ? "Saving..." : editingId ? "Save Changes" : "Add Experience"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Experience List */}
                {experiences.map((exp) =>
                    editingId === exp.id ? null : (
                        <div
                            key={exp.id}
                            className="p-4 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.06] transition-all group"
                        >
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <h3 className="font-semibold text-foreground">{exp.title}</h3>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Building2 className="h-4 w-4" />
                                        <span>{exp.company}</span>
                                        {exp.location && (
                                            <>
                                                <span className="text-muted-foreground/40">•</span>
                                                <MapPin className="h-4 w-4" />
                                                <span>{exp.location}</span>
                                            </>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span>
                                            {exp.startDate
                                                ? new Date(exp.startDate).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    year: "numeric",
                                                })
                                                : "Unknown"}{" "}
                                            -{" "}
                                            {exp.isCurrent === "true"
                                                ? "Present"
                                                : exp.endDate
                                                    ? new Date(exp.endDate).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        year: "numeric",
                                                    })
                                                    : "Unknown"}
                                        </span>
                                    </div>
                                    {exp.description && (
                                        <p className="text-sm text-muted-foreground mt-2">
                                            {exp.description}
                                        </p>
                                    )}
                                    {exp.accomplishments && exp.accomplishments.length > 0 && (
                                        <ul className="mt-2 space-y-1">
                                            {exp.accomplishments.slice(0, 3).map((item, idx) => (
                                                <li key={idx} className="text-sm text-muted-foreground/80 flex items-start gap-2">
                                                    <span className="text-active-blue mt-1">•</span>
                                                    <span className="line-clamp-1">{item}</span>
                                                </li>
                                            ))}
                                            {exp.accomplishments.length > 3 && (
                                                <li className="text-xs text-muted-foreground/60 pl-4">
                                                    +{exp.accomplishments.length - 3} more...
                                                </li>
                                            )}
                                        </ul>
                                    )}
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleEdit(exp)}
                                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-white/10 rounded-lg transition-all"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(exp.id)}
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
