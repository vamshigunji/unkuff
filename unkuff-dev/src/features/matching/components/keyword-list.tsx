"use client";

import { cn } from "@/lib/utils";
import { Badge } from "lucide-react";

interface KeywordListProps {
    keywords: {
        hardSkills: string[];
        softSkills: string[];
        domainKeywords: string[];
        atsKeywords: string[];
        certifications?: string[];
        methodologies?: string[];
    } | null;
    isLoading?: boolean;
}

export function KeywordList({ keywords, isLoading }: KeywordListProps) {
    if (isLoading) {
        return (
            <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-white/10 rounded w-1/4" />
                <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-6 bg-white/10 rounded-full w-16" />
                    ))}
                </div>
            </div>
        );
    }

    if (!keywords || (keywords.hardSkills.length === 0 && keywords.softSkills.length === 0)) {
        return <p className="text-xs text-muted-foreground italic">No keywords extracted yet.</p>;
    }

    return (
        <div className="space-y-4">
            <KeywordGroup title="Hard Skills" items={keywords.hardSkills} color="text-active-blue" />
            <KeywordGroup title="Soft Skills" items={keywords.softSkills} color="text-emerald-400" />
            <KeywordGroup title="Domain Keywords" items={keywords.domainKeywords} color="text-cyan-400" />
            <KeywordGroup title="ATS Targets" items={keywords.atsKeywords} color="text-amber-400" />
            {keywords.methodologies && <KeywordGroup title="Methodologies" items={keywords.methodologies} color="text-purple-400" />}
            {keywords.certifications && <KeywordGroup title="Certifications" items={keywords.certifications} color="text-blue-400" />}
        </div>
    );
}

function KeywordGroup({ title, items, color }: { title: string, items: string[], color: string }) {
    if (!items.length) return null;
    return (
        <div className="space-y-2">
            <h4 className={cn("text-[10px] font-bold uppercase tracking-widest", color)}>{title}</h4>
            <div className="flex flex-wrap gap-1.5">
                {items.map((item, i) => (
                    <span 
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs text-muted-foreground"
                    >
                        {item}
                    </span>
                ))}
            </div>
        </div>
    );
}
