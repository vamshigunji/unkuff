"use client";

import { useState, useCallback, useTransition } from "react";
import { Plus, Trash2, Target, TrendingUp } from "lucide-react";
import { SectionWrapper } from "./section-wrapper";
import { AccomplishmentData } from "./profile-editor";
import { addAccomplishment, deleteAccomplishment } from "../actions";

interface AccomplishmentsSectionProps {
    profileId: string;
    initialData: AccomplishmentData[];
    onSaveStart: () => void;
    onSaveComplete: (success: boolean) => void;
}

interface AccomplishmentFormData {
    title: string;
    description: string;
    impact: string;
    category: string;
}

const emptyForm: AccomplishmentFormData = {
    title: "",
    description: "",
    impact: "",
    category: "General",
};

const CATEGORIES = [
    "General",
    "Revenue Growth",
    "Cost Savings",
    "Process Improvement",
    "Team Leadership",
    "Technical Innovation",
    "Customer Success",
    "Awards & Recognition",
];

export function AccomplishmentsSection({
    profileId,
    initialData,
    onSaveStart,
    onSaveComplete,
}: AccomplishmentsSectionProps) {
    const [isPending, startTransition] = useTransition();
    const [accomplishments, setAccomplishments] = useState<AccomplishmentData[]>(initialData);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState<AccomplishmentFormData>(emptyForm);

    const handleAdd = () => {
        setIsAdding(true);
        setFormData(emptyForm);
    };

    const handleCancel = () => {
        setIsAdding(false);
        setFormData(emptyForm);
    };

    const handleSave = useCallback(() => {
        if (!formData.title.trim() || !formData.description.trim()) return;

        startTransition(async () => {
            onSaveStart();
            const result = await addAccomplishment(profileId, formData);

            if (result.error) {
                onSaveComplete(false);
            } else {
                setAccomplishments((prev) => [
                    {
                        id: result.data!.id,
                        profileId,
                        title: formData.title,
                        description: formData.description,
                        impact: formData.impact || null,
                        category: formData.category || null,
                    },
                    ...prev,
                ]);
                onSaveComplete(true);
                handleCancel();
            }
        });
    }, [formData, profileId, onSaveStart, onSaveComplete]);

    const handleDelete = useCallback(
        (id: string) => {
            startTransition(async () => {
                onSaveStart();
                const result = await deleteAccomplishment(id);
                if (result.error) {
                    onSaveComplete(false);
                } else {
                    setAccomplishments((prev) => prev.filter((a) => a.id !== id));
                    onSaveComplete(true);
                }
            });
        },
        [onSaveStart, onSaveComplete]
    );

    const updateField = (field: keyof AccomplishmentFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // Group by category
    const groupedAccomplishments = accomplishments.reduce((acc, item) => {
        const cat = item.category || "General";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {} as Record<string, AccomplishmentData[]>);

    return (
        <SectionWrapper
            title="Accomplishments"
            description="Quantifiable achievements that demonstrate your impact"
            headerAction={
                !isAdding && (
                    <button
                        onClick={handleAdd}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-active-blue hover:text-active-blue/80 bg-active-blue/10 hover:bg-active-blue/20 rounded-lg transition-all"
                    >
                        <Plus className="h-4 w-4" />
                        Add Accomplishment
                    </button>
                )
            }
        >
            <div className="space-y-4">
                {/* AI Tip */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-green/10 border border-emerald-green/20">
                    <TrendingUp className="h-5 w-5 text-emerald-green mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                        <strong className="text-foreground">Achievement Formula:</strong> Use the CAR method - Challenge faced, Action taken, Result achieved. Include specific numbers like "$2M revenue increase" or "40% efficiency improvement".
                    </p>
                </div>

                {/* Add Form */}
                {isAdding && (
                    <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => updateField("title", e.target.value)}
                                    placeholder="Led Platform Migration Project"
                                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-active-blue/50 focus:border-active-blue/50 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => updateField("category", e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-foreground focus:outline-none focus:ring-2 focus:ring-active-blue/50 focus:border-active-blue/50 transition-all"
                                >
                                    {CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Description *</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => updateField("description", e.target.value)}
                                rows={3}
                                placeholder="Describe the challenge you faced and the actions you took..."
                                className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-active-blue/50 focus:border-active-blue/50 transition-all resize-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                                Quantifiable Impact
                                <span className="text-emerald-green ml-2 text-xs">(Highly Recommended)</span>
                            </label>
                            <input
                                type="text"
                                value={formData.impact}
                                onChange={(e) => updateField("impact", e.target.value)}
                                placeholder="e.g., Reduced costs by $500K annually, Improved performance by 3x"
                                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-active-blue/50 focus:border-active-blue/50 transition-all"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-2">
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isPending || !formData.title.trim() || !formData.description.trim()}
                                className="px-4 py-2 text-sm font-medium bg-active-blue text-white rounded-lg hover:bg-active-blue/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {isPending ? "Adding..." : "Add Accomplishment"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Accomplishments List */}
                {accomplishments.length === 0 && !isAdding ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Target className="h-12 w-12 mx-auto mb-3 opacity-40" />
                        <p>No accomplishments added yet</p>
                        <p className="text-sm">Add your key achievements to power your resume</p>
                    </div>
                ) : (
                    Object.entries(groupedAccomplishments).map(([category, items]) => (
                        <div key={category} className="space-y-3">
                            <h4 className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">
                                {category}
                            </h4>
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="p-4 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.06] transition-all group"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1 flex-1">
                                            <h3 className="font-semibold text-foreground">{item.title}</h3>
                                            <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                                            {item.impact && (
                                                <div className="flex items-center gap-2 mt-2">
                                                    <TrendingUp className="h-4 w-4 text-emerald-green" />
                                                    <span className="text-sm text-emerald-green font-medium">{item.impact}</span>
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))
                )}
            </div>
        </SectionWrapper>
    );
}
