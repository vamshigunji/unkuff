"use client";

import React, { useState, useCallback, useEffect, useTransition, useRef } from "react";
import { SectionWrapper } from "./section-wrapper";
import { ProfileData } from "./profile-editor";
import { saveProfile } from "../actions";

interface ContactSectionProps {
    userId: string;
    userEmail: string;
    userName: string;
    initialData: ProfileData | null;
    onSaveStart: () => void;
    onSaveComplete: (success: boolean) => void;
}

export function ContactSection({
    userId,
    userEmail,
    userName,
    initialData,
    onSaveStart,
    onSaveComplete,
}: ContactSectionProps) {
    const [isPending, startTransition] = useTransition();

    // Form state - contact info only (summary is in separate step)
    const [formData, setFormData] = useState({
        name: initialData?.name || userName || "",
        location: initialData?.location || "",
        phone: initialData?.phone || "",
        address: initialData?.address || "",
        idNumber: initialData?.idNumber || "",
    });

    // Debounce timer ref - using useRef to avoid re-renders
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleChange = useCallback(
        (field: keyof typeof formData, value: string) => {
            setFormData((prev) => ({ ...prev, [field]: value }));

            // Clear existing timeout
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }

            // Debounce save (300ms)
            saveTimeoutRef.current = setTimeout(() => {
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
                    }
                });
            }, 300);
        },
        [formData, onSaveStart, onSaveComplete, userId]
    );

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div className="space-y-6">
            {/* Basic Info */}
            <SectionWrapper
                title="Basic Information"
                description="Your primary contact details and professional identity"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            placeholder="John Doe"
                            className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-active-blue/50 focus:border-active-blue/50 transition-all"
                        />
                    </div>

                    {/* Email (Read-only from Auth) */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                            Email
                        </label>
                        <input
                            type="email"
                            value={userEmail}
                            disabled
                            className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-muted-foreground cursor-not-allowed"
                        />
                        <p className="text-xs text-muted-foreground/60">
                            Email is managed through your account settings
                        </p>
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                            Location
                        </label>
                        <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => handleChange("location", e.target.value)}
                            placeholder="San Francisco, CA"
                            className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-active-blue/50 focus:border-active-blue/50 transition-all"
                        />
                    </div>

                    {/* Phone (PII - Encrypted) */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            Phone
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-green/20 text-emerald-green">
                                Encrypted
                            </span>
                        </label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleChange("phone", e.target.value)}
                            placeholder="+1 (555) 123-4567"
                            className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-active-blue/50 focus:border-active-blue/50 transition-all"
                        />
                    </div>
                </div>
            </SectionWrapper>

            {/* Private Information */}
            <SectionWrapper
                title="Private Information"
                description="Sensitive data stored with AES-256 encryption"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Address (PII - Encrypted) */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            Address
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-green/20 text-emerald-green">
                                Encrypted
                            </span>
                        </label>
                        <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => handleChange("address", e.target.value)}
                            placeholder="123 Main St, Apt 4B"
                            className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-active-blue/50 focus:border-active-blue/50 transition-all"
                        />
                    </div>

                    {/* ID Number (PII - Encrypted) */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            ID Number
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-green/20 text-emerald-green">
                                Encrypted
                            </span>
                        </label>
                        <input
                            type="text"
                            value={formData.idNumber}
                            onChange={(e) => handleChange("idNumber", e.target.value)}
                            placeholder="SSN or Government ID"
                            className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-active-blue/50 focus:border-active-blue/50 transition-all"
                        />
                        <p className="text-xs text-muted-foreground/60">
                            Never shared with AI or external services
                        </p>
                    </div>
                </div>
            </SectionWrapper>
        </div>
    );
}
