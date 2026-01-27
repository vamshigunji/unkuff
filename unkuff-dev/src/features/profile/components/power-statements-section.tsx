"use client";

import { useState, useCallback, useTransition } from "react";
import { Plus, Trash2, Lightbulb, Zap, Copy, Check } from "lucide-react";
import { SectionWrapper } from "./section-wrapper";
import { PowerStatementData } from "./profile-editor";
import { addPowerStatement, deletePowerStatement } from "../actions";

interface PowerStatementsSectionProps {
    profileId: string;
    initialData: PowerStatementData[];
    onSaveStart: () => void;
    onSaveComplete: (success: boolean) => void;
}

interface PowerStatementFormData {
    statement: string;
    context: string;
    category: string;
}

const emptyForm: PowerStatementFormData = {
    statement: "",
    context: "",
    category: "Leadership",
};

const CATEGORIES = [
    "Leadership",
    "Technical Excellence",
    "Problem Solving",
    "Communication",
    "Innovation",
    "Results Orientation",
    "Teamwork",
    "Strategic Thinking",
];

const EXAMPLES = [
    "Led cross-functional team of 12 to deliver enterprise platform migration 3 months ahead of schedule, resulting in $2M annual cost savings",
    "Architected and implemented microservices infrastructure processing 50M+ daily transactions with 99.99% uptime",
    "Mentored team of 8 engineers, with 4 promoted to senior roles within 18 months",
    "Spearheaded adoption of CI/CD practices, reducing deployment time from 2 weeks to 2 hours",
];

export function PowerStatementsSection({
    profileId,
    initialData,
    onSaveStart,
    onSaveComplete,
}: PowerStatementsSectionProps) {
    const [isPending, startTransition] = useTransition();
    const [statements, setStatements] = useState<PowerStatementData[]>(initialData);
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState<PowerStatementFormData>(emptyForm);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleAdd = () => {
        setIsAdding(true);
        setFormData(emptyForm);
    };

    const handleCancel = () => {
        setIsAdding(false);
        setFormData(emptyForm);
    };

    const handleSave = useCallback(() => {
        if (!formData.statement.trim()) return;

        startTransition(async () => {
            onSaveStart();
            const result = await addPowerStatement(profileId, formData);

            if (result.error) {
                onSaveComplete(false);
            } else {
                setStatements((prev) => [
                    {
                        id: result.data!.id,
                        profileId,
                        statement: formData.statement,
                        context: formData.context || null,
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
                const result = await deletePowerStatement(id);
                if (result.error) {
                    onSaveComplete(false);
                } else {
                    setStatements((prev) => prev.filter((s) => s.id !== id));
                    onSaveComplete(true);
                }
            });
        },
        [onSaveStart, onSaveComplete]
    );

    const handleCopy = (statement: string, id: string) => {
        navigator.clipboard.writeText(statement);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const useExample = (example: string) => {
        setFormData((prev) => ({ ...prev, statement: example }));
    };

    const updateField = (field: keyof PowerStatementFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // Group by category
    const groupedStatements = statements.reduce((acc, item) => {
        const cat = item.category || "General";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {} as Record<string, PowerStatementData[]>);

    return (
        <SectionWrapper
            title="Power Statements"
            description="Pre-written achievement bullets ready to drop into any resume"
            headerAction={
                !isAdding && (
                    <button
                        onClick={handleAdd}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-active-blue hover:text-active-blue/80 bg-active-blue/10 hover:bg-active-blue/20 rounded-lg transition-all"
                    >
                        <Plus className="h-4 w-4" />
                        Add Statement
                    </button>
                )
            }
        >
            <div className="space-y-4">
                {/* What are Power Statements */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-active-blue/10 border border-active-blue/20">
                    <Zap className="h-5 w-5 text-active-blue mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-muted-foreground">
                        <strong className="text-foreground">Power Statements</strong> are pre-crafted, action-driven bullet points that showcase your achievements. AI will select and tailor the most relevant statements for each job application.
                    </div>
                </div>

                {/* Add Form */}
                {isAdding && (
                    <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 space-y-4">
                        {/* Example Statements */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-muted-foreground/60">EXAMPLE TEMPLATES (click to use)</label>
                            <div className="flex flex-wrap gap-2">
                                {EXAMPLES.map((example, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => useExample(example)}
                                        className="text-left text-xs px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] transition-all line-clamp-1 max-w-xs"
                                    >
                                        {example.substring(0, 50)}...
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-muted-foreground">Power Statement *</label>
                                <textarea
                                    value={formData.statement}
                                    onChange={(e) => updateField("statement", e.target.value)}
                                    rows={3}
                                    placeholder="Action verb + What you did + Quantifiable result. Example: Increased team velocity by 40% through implementation of automated testing framework"
                                    className="w-full px-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-active-blue/50 focus:border-active-blue/50 transition-all resize-none"
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
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Context (Optional)</label>
                                <input
                                    type="text"
                                    value={formData.context}
                                    onChange={(e) => updateField("context", e.target.value)}
                                    placeholder="e.g., At Company X, For Product Y launch"
                                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-active-blue/50 focus:border-active-blue/50 transition-all"
                                />
                            </div>
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
                                disabled={isPending || !formData.statement.trim()}
                                className="px-4 py-2 text-sm font-medium bg-active-blue text-white rounded-lg hover:bg-active-blue/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {isPending ? "Adding..." : "Add Statement"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Statements List */}
                {statements.length === 0 && !isAdding ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Lightbulb className="h-12 w-12 mx-auto mb-3 opacity-40" />
                        <p>No power statements added yet</p>
                        <p className="text-sm">Create reusable achievement bullets for your resumes</p>
                    </div>
                ) : (
                    Object.entries(groupedStatements).map(([category, items]) => (
                        <div key={category} className="space-y-3">
                            <h4 className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">
                                {category}
                            </h4>
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="p-4 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.06] transition-all group"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                            <p className="text-sm text-foreground">{item.statement}</p>
                                            {item.context && (
                                                <p className="text-xs text-muted-foreground/60 mt-1">
                                                    Context: {item.context}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleCopy(item.statement, item.id)}
                                                className="p-2 text-muted-foreground hover:text-foreground hover:bg-white/10 rounded-lg transition-all"
                                                title="Copy to clipboard"
                                            >
                                                {copiedId === item.id ? (
                                                    <Check className="h-4 w-4 text-emerald-green" />
                                                ) : (
                                                    <Copy className="h-4 w-4" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
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
