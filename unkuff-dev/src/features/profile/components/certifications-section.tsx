"use client";

import { useState, useCallback, useTransition } from "react";
import { Plus, Trash2, Award, Calendar, ExternalLink, Loader2 } from "lucide-react";
import { SectionWrapper } from "./section-wrapper";
import { CertificationData } from "./profile-editor";
import { addCertification, updateCertification, deleteCertification } from "../actions";

interface CertificationsSectionProps {
    profileId: string;
    initialData: CertificationData[];
    onSaveStart: () => void;
    onSaveComplete: (success: boolean) => void;
}

interface CertFormData {
    name: string;
    issuer: string;
    issueDate: string;
    expiryDate: string;
    credentialId: string;
    link: string;
}

const emptyForm: CertFormData = {
    name: "",
    issuer: "",
    issueDate: "",
    expiryDate: "",
    credentialId: "",
    link: "",
};

export function CertificationsSection({
    profileId,
    initialData,
    onSaveStart,
    onSaveComplete,
}: CertificationsSectionProps) {
    const [isPending, startTransition] = useTransition();
    const [certifications, setCertifications] = useState<CertificationData[]>(initialData);
    const [editingId, setEditingId] = useState<string | null>(null);
    // Show form by default if no certifications exist
    const [isAdding, setIsAdding] = useState(initialData.length === 0);
    const [formData, setFormData] = useState<CertFormData>(emptyForm);

    const formatDateForInput = (date: Date | null) => {
        if (!date) return "";
        return new Date(date).toISOString().split("T")[0];
    };

    const handleEdit = (cert: CertificationData) => {
        setEditingId(cert.id);
        setIsAdding(false);
        setFormData({
            name: cert.name,
            issuer: cert.issuer,
            issueDate: formatDateForInput(cert.issueDate),
            expiryDate: formatDateForInput(cert.expiryDate),
            credentialId: cert.credentialId || "",
            link: cert.link || "",
        });
    };

    const handleAddAnother = () => {
        setIsAdding(true);
        setEditingId(null);
        setFormData(emptyForm);
    };

    const handleCancel = () => {
        if (certifications.length > 0) {
            setEditingId(null);
            setIsAdding(false);
        }
        setFormData(emptyForm);
    };

    const handleSave = useCallback(() => {
        if (!formData.name || !formData.issuer) return;

        startTransition(async () => {
            onSaveStart();

            if (isAdding || !editingId) {
                const result = await addCertification(profileId, formData);
                if (result.error) {
                    onSaveComplete(false);
                } else {
                    setCertifications((prev) => [
                        {
                            id: result.data!.id,
                            profileId,
                            name: formData.name,
                            issuer: formData.issuer,
                            issueDate: formData.issueDate ? new Date(formData.issueDate) : null,
                            expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : null,
                            credentialId: formData.credentialId || null,
                            link: formData.link || null,
                        },
                        ...prev,
                    ]);
                    onSaveComplete(true);
                    setFormData(emptyForm);
                    setIsAdding(false);
                }
            } else if (editingId) {
                const result = await updateCertification(editingId, formData);
                if (result.error) {
                    onSaveComplete(false);
                } else {
                    setCertifications((prev) =>
                        prev.map((cert) =>
                            cert.id === editingId
                                ? {
                                    ...cert,
                                    name: formData.name,
                                    issuer: formData.issuer,
                                    issueDate: formData.issueDate ? new Date(formData.issueDate) : null,
                                    expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : null,
                                    credentialId: formData.credentialId || null,
                                    link: formData.link || null,
                                }
                                : cert
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
                const result = await deleteCertification(id);
                if (result.error) {
                    onSaveComplete(false);
                } else {
                    setCertifications((prev) => {
                        const newList = prev.filter((cert) => cert.id !== id);
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

    const updateField = (field: keyof CertFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const isExpired = (date: Date | null) => {
        if (!date) return false;
        return new Date(date) < new Date();
    };

    return (
        <SectionWrapper
            title="Certifications"
            description="Your professional certifications and credentials"
            headerAction={
                certifications.length > 0 && !isAdding && !editingId && (
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
                                <label className="text-sm font-medium text-muted-foreground">Certification Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => updateField("name", e.target.value)}
                                    placeholder="AWS Solutions Architect"
                                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-active-blue/50 focus:border-active-blue/50 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Issuing Organization *</label>
                                <input
                                    type="text"
                                    value={formData.issuer}
                                    onChange={(e) => updateField("issuer", e.target.value)}
                                    placeholder="Amazon Web Services"
                                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-active-blue/50 focus:border-active-blue/50 transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Issue Date</label>
                                <input
                                    type="date"
                                    value={formData.issueDate}
                                    onChange={(e) => updateField("issueDate", e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-foreground focus:outline-none focus:ring-2 focus:ring-active-blue/50 focus:border-active-blue/50 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Expiry Date</label>
                                <input
                                    type="date"
                                    value={formData.expiryDate}
                                    onChange={(e) => updateField("expiryDate", e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-foreground focus:outline-none focus:ring-2 focus:ring-active-blue/50 focus:border-active-blue/50 transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Credential ID</label>
                                <input
                                    type="text"
                                    value={formData.credentialId}
                                    onChange={(e) => updateField("credentialId", e.target.value)}
                                    placeholder="ABC123XYZ"
                                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-active-blue/50 focus:border-active-blue/50 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-muted-foreground">Credential URL</label>
                                <input
                                    type="url"
                                    value={formData.link}
                                    onChange={(e) => updateField("link", e.target.value)}
                                    placeholder="https://www.credly.com/..."
                                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-active-blue/50 focus:border-active-blue/50 transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2">
                            {certifications.length > 0 && (
                                <button
                                    onClick={handleCancel}
                                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                onClick={handleSave}
                                disabled={isPending || !formData.name || !formData.issuer}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-active-blue text-white rounded-lg hover:bg-active-blue/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                                {isPending ? "Saving..." : editingId ? "Save Changes" : "Add Certification"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Certifications List */}
                {certifications.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {certifications.map((cert) =>
                            editingId === cert.id ? null : (
                                <div
                                    key={cert.id}
                                    className="p-4 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.06] transition-all group"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1 flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-foreground">{cert.name}</h3>
                                                {isExpired(cert.expiryDate) && (
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">
                                                        Expired
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Award className="h-4 w-4" />
                                                <span>{cert.issuer}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground/60">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {cert.issueDate
                                                        ? new Date(cert.issueDate).toLocaleDateString("en-US", {
                                                            month: "short",
                                                            year: "numeric",
                                                        })
                                                        : "No date"}
                                                </span>
                                                {cert.credentialId && (
                                                    <span className="text-muted-foreground/40">
                                                        ID: {cert.credentialId}
                                                    </span>
                                                )}
                                            </div>
                                            {cert.link && (
                                                <a
                                                    href={cert.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-xs text-active-blue hover:underline mt-1"
                                                >
                                                    <ExternalLink className="h-3 w-3" />
                                                    View Credential
                                                </a>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEdit(cert)}
                                                className="p-2 text-muted-foreground hover:text-foreground hover:bg-white/10 rounded-lg transition-all"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(cert.id)}
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
                )}
            </div>
        </SectionWrapper>
    );
}
