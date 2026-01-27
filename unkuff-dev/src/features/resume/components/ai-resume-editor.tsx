"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
    X, 
    Check, 
    Sparkles, 
    Info, 
    FileText, 
    RotateCcw,
    RotateCw,
    Save,
    Columns
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ResumeData } from "../types";
import { PaperPreview } from "./paper-preview";
import { TEMPLATES, type TemplateId } from "../templates";
import { Button } from "@/components/ui/button";
import { TailorTrigger } from "@/features/tailoring/components/tailor-trigger";

interface AIResumeEditorProps {
    initialData: ResumeData | null;
    hasProfile: boolean;
}

export function AIResumeEditor({ initialData, hasProfile }: AIResumeEditorProps) {
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>("modern");
    const [activeTab, setActiveTab] = useState<"resume" | "cover" | "job">("resume");
    const [skillsTab, setSkillsTab] = useState<"skills" | "searchability" | "tips">("skills");
    const router = useRouter();

    const handleClose = () => {
        router.push('/dashboard/resumes');
    };

    if (!initialData || !hasProfile) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="p-4 rounded-full bg-white/5 border border-white/10">
                    <FileText className="w-12 h-12 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-bold">No Resume Data Found</h2>
                <p className="text-muted-foreground max-w-md">
                    Please ensure you have a completed profile or select a job to tailor a resume.
                </p>
                <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
            </div>
        );
    }

    // High-fidelity match score
    const matchScore = 87;

    return (
        <div className="fixed inset-0 z-50 bg-background flex flex-col animate-in fade-in duration-500 overflow-hidden text-foreground">
            {/* Top Navigation Bar */}
            <header className="h-[72px] border-b border-white/10 flex items-center justify-between px-8 bg-card shrink-0 z-20">
                <div className="flex items-center gap-8 h-full">
                    {/* Tabs */}
                    <div className="flex h-full border-r border-white/10 pr-8">
                        {(['resume', 'cover', 'job'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "px-4 h-full text-sm font-medium transition-all relative flex items-center",
                                    activeTab === tab ? "text-primary" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {tab === 'resume' ? 'Resume' : tab === 'cover' ? 'Cover Letter' : 'Job Description'}
                                {activeTab === tab && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Format Dropdown */}
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-4 h-10">
                        <span className="text-xs text-muted-foreground">Format:</span>
                        <select 
                            value={selectedTemplate}
                            onChange={(e) => setSelectedTemplate(e.target.value as TemplateId)}
                            className="bg-transparent text-xs font-bold border-none focus:ring-0 cursor-pointer text-white"
                        >
                            {Object.entries(TEMPLATES).map(([id, t]) => (
                                <option key={id} value={id} className="bg-card">{t.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Undo/Redo */}
                    <div className="flex items-center gap-1">
                        <button className="p-2 hover:bg-white/5 rounded-lg text-muted-foreground"><RotateCcw size={18} /></button>
                        <button className="p-2 hover:bg-white/5 rounded-lg text-muted-foreground"><RotateCw size={18} /></button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Button className="bg-[#ff8303] hover:bg-[#e67602] text-white rounded-xl gap-2 font-bold px-6 h-10">
                        <Save size={18} />
                        Save Resume
                    </Button>
                    <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl gap-2 h-10 px-6">
                        <Columns size={18} />
                        Compare
                    </Button>
                    <button onClick={handleClose} className="ml-4 p-2 text-muted-foreground hover:text-white"><X size={24} /></button>
                </div>
            </header>

            <div className="flex flex-1 min-h-0">
                {/* Left Sidebar: Analysis */}
                <aside className="w-[380px] border-r border-white/10 bg-card flex flex-col shrink-0 overflow-y-auto scrollbar-hide">
                    {/* Summary Header */}
                    <div className="p-8 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="relative w-20 h-20 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/5" />
                                    <circle cx="40" cy="40" r="36" stroke="#ff8303" strokeWidth="4" fill="transparent" strokeDasharray="226.2" strokeDashoffset={226.2 * (1 - (initialData.atsScore || matchScore) / 100)} strokeLinecap="round" />
                                </svg>
                                <span className="absolute text-2xl font-mono font-bold text-[#ff8303]">{initialData.atsScore || matchScore}</span>
                            </div>
                            <div className="space-y-1 min-w-0">
                                <h2 className="text-lg font-bold text-white leading-tight truncate">
                                    {initialData.experience?.[0]?.company || "Google"}
                                </h2>
                                <p className="text-sm text-muted-foreground truncate">
                                    {initialData.experience?.[0]?.title || "Senior Product Designer"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/5">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <span className="text-xs font-medium">Tailored Resume v2</span>
                        </div>
                    </div>

                    {/* Analysis Tabs */}
                    <div className="flex px-8 border-b border-white/5">
                        {(['skills', 'searchability', 'tips'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setSkillsTab(tab)}
                                className={cn(
                                    "pb-4 text-xs font-bold uppercase tracking-wider transition-all relative pr-8",
                                    skillsTab === tab ? "text-white" : "text-muted-foreground hover:text-white"
                                )}
                            >
                                {tab}
                                {skillsTab === tab && (
                                    <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-[#ff8303]" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Analysis Content */}
                    <div className="p-8 space-y-8 text-foreground">
                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-bold uppercase tracking-widest text-white">Hard skills</span>
                                    <Info size={12} className="text-muted-foreground" />
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex items-center gap-1 text-[10px]"><span className="text-muted-foreground">Matched</span> <span className="text-emerald-400 font-bold">11</span></div>
                                    <div className="flex items-center gap-1 text-[10px]"><span className="text-muted-foreground">Added</span> <span className="text-blue-400 font-bold">4</span></div>
                                    <div className="flex items-center gap-1 text-[10px]"><span className="text-muted-foreground">Missing</span> <span className="text-red-400 font-bold">5</span></div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {[
                                    { name: "Design Systems", status: "matched" },
                                    { name: "Figma", status: "matched" },
                                    { name: "Prototyping", status: "matched" },
                                    { name: "User Research", status: "added" },
                                    { name: "A/B Testing", status: "added" },
                                    { name: "Data Visualization", status: "missing" },
                                    { name: "Stakeholder Management", status: "missing" },
                                ].map((skill, i) => (
                                    <div key={i} className={cn(
                                        "flex items-center justify-between p-3 rounded-xl border transition-all",
                                        skill.status === "matched" ? "bg-white/5 border-transparent opacity-80" :
                                        skill.status === "added" ? "bg-blue-500/10 border-blue-500/30" :
                                        "bg-red-500/10 border-red-500/30"
                                    )}>
                                        <div className="flex items-center gap-3">
                                            {skill.status === "matched" && <Check size={14} className="text-emerald-500" />}
                                            {skill.status === "added" && <Sparkles size={14} className="text-blue-400" />}
                                            {skill.status === "missing" && <X size={14} className="text-red-400" />}
                                            <span className="text-xs font-medium text-foreground">{skill.name}</span>
                                        </div>
                                        {skill.status !== "matched" && (
                                            <span className={cn(
                                                "text-[8px] font-bold uppercase px-1.5 py-0.5 rounded",
                                                skill.status === "added" ? "bg-blue-400/20 text-blue-400" : "bg-red-400/20 text-red-400"
                                            )}>
                                                {skill.status === "added" ? "AI Added" : "Missing"}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 bg-neutral-950/40 p-12 overflow-y-auto scrollbar-thin relative text-black">
                    <div className="max-w-[850px] mx-auto">
                        <div className="bg-white rounded-sm shadow-[0_32px_128px_-16px_rgba(0,0,0,0.6)] animate-in slide-in-from-bottom-8 duration-1000">
                             <PaperPreview 
                                data={initialData} 
                                templateId={selectedTemplate} 
                                className="p-12" 
                            />
                        </div>
                    </div>

                    {/* Fixed Bottom Tailor Button */}
                    <div className="fixed bottom-12 left-[calc(380px+(100%-380px-280px)/2)] -translate-x-1/2 z-30">
                        <TailorTrigger 
                            jobId={initialData.jobId || ""}
                            className="bg-[#ff8303] hover:bg-[#e67602] text-white h-14 px-10 rounded-2xl font-bold shadow-2xl flex items-center gap-3 transition-transform hover:scale-105 active:scale-95"
                        />
                    </div>
                </main>

                {/* Right Sidebar: Formats */}
                <aside className="w-[280px] border-l border-white/10 bg-card p-6 overflow-y-auto shrink-0 text-foreground">
                    <div className="flex items-center justify-between mb-6 text-foreground">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">Resume Formats</h3>
                        <span className="text-[10px] text-muted-foreground">6 templates</span>
                    </div>

                    <div className="space-y-4">
                        {Object.entries(TEMPLATES).map(([id, template]) => (
                            <button
                                key={id}
                                onClick={() => setSelectedTemplate(id as TemplateId)}
                                className={cn(
                                    "w-full group rounded-xl border p-2 transition-all text-foreground",
                                    selectedTemplate === id ? "border-[#ff8303] bg-[#ff8303]/5" : "border-white/5 hover:border-white/20"
                                )}
                            >
                                <div className="aspect-[1/1.4] bg-white rounded-sm mb-3 overflow-hidden border border-black/5">
                                    {/* Mini template preview could go here */}
                                    <div className="w-full h-4 bg-neutral-100 mb-2" />
                                    <div className="w-2/3 h-2 bg-neutral-100 mb-1 ml-4" />
                                    <div className="w-1/2 h-2 bg-neutral-100 ml-4" />
                                </div>
                                <div className="flex items-center justify-between px-1">
                                    <span className="text-xs font-bold">{template.name}</span>
                                    {selectedTemplate === id && (
                                        <span className="bg-[#ff8303] text-white text-[8px] font-bold px-1.5 py-0.5 rounded">ACTIVE</span>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </aside>
            </div>
        </div>
    );
}
