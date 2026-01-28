"use client";

import { useState, useEffect } from "react";
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
    Columns,
    Zap,
    Bold,
    Italic,
    Underline,
    Briefcase
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
    
    // Local state for live editing
    const [resumeContent, setResumeContent] = useState<ResumeData | null>(initialData);

    // Sync state when initialData changes (e.g., navigating between different jobs)
    useEffect(() => {
        if (initialData) {
            console.log("[AIResumeEditor] Syncing state with new job context:", initialData.jobCompany);
            setResumeContent(initialData);
        }
    }, [initialData]);

    const handleClose = () => {
        router.push('/dashboard');
    };

    if (!resumeContent || !hasProfile) {
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
    const matchScore = resumeContent.atsScore || 0;

    return (
        <div className="fixed inset-0 z-50 bg-background flex flex-col animate-in fade-in duration-500 overflow-hidden text-foreground">
            {/* Top Navigation Bar with Editor Tools */}
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

                    {/* Basic Editor Tools */}
                    <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/10">
                        <button className="p-1.5 hover:bg-white/10 rounded text-muted-foreground hover:text-white transition-colors">
                            <Bold size={16} />
                        </button>
                        <button className="p-1.5 hover:bg-white/10 rounded text-muted-foreground hover:text-white transition-colors">
                            <Italic size={16} />
                        </button>
                        <button className="p-1.5 hover:bg-white/10 rounded text-muted-foreground hover:text-white transition-colors">
                            <Underline size={16} />
                        </button>
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
                    <button onClick={handleClose} className="ml-4 p-2 text-muted-foreground hover:text-white transition-colors"><X size={24} /></button>
                </div>
            </header>

            <div className="flex flex-1 min-h-0">
                {/* Left Sidebar: Analysis */}
                <aside className="w-[380px] border-r border-white/10 bg-card flex flex-col shrink-0 overflow-y-auto scrollbar-hide">
                    {/* Summary Header */}
                    <div className="p-8 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/5" />
                                    <circle cx="40" cy="40" r="36" stroke="#ff8303" strokeWidth="4" fill="transparent" strokeDasharray="226.2" strokeDashoffset={226.2 * (1 - matchScore / 100)} strokeLinecap="round" />
                                </svg>
                                <span className="absolute text-2xl font-mono font-bold text-[#ff8303]">{matchScore}</span>
                            </div>
                            <div className="space-y-1 min-w-0">
                                <h2 className="text-lg font-bold text-white leading-tight truncate">
                                    {resumeContent.jobCompany || "Target Company"}
                                </h2>
                                <p className="text-sm text-muted-foreground truncate font-medium">
                                    {resumeContent.jobTitle || "Target Role"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/5">
                            <Briefcase className="w-4 h-4 text-muted-foreground" />
                            <span className="text-xs font-bold uppercase tracking-tight text-white/80">Active Context</span>
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
                                    <span className="text-[11px] font-bold uppercase tracking-widest text-white">Keyword Matching</span>
                                    <Info size={12} className="text-muted-foreground" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                {/* Real keywords would load here from analysis */}
                                {[
                                    { name: "Python", status: "matched" },
                                    { name: "SQL", status: "matched" },
                                    { name: "Machine Learning", status: "matched" },
                                    { name: "PyTorch", status: "missing" },
                                    { name: "Distributed Systems", status: "missing" },
                                ].map((skill, i) => (
                                    <div key={i} className={cn(
                                        "flex items-center justify-between p-3 rounded-xl border transition-all",
                                        skill.status === "matched" ? "bg-white/5 border-transparent opacity-80" :
                                        "bg-red-500/10 border-red-500/30"
                                    )}>
                                        <div className="flex items-center gap-3">
                                            {skill.status === "matched" && <Check size={14} className="text-emerald-500" />}
                                            {skill.status === "missing" && <X size={14} className="text-red-400" />}
                                            <span className="text-xs font-medium text-foreground">{skill.name}</span>
                                        </div>
                                        {skill.status === "missing" && (
                                            <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-red-400/20 text-red-400">
                                                Missing
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </aside>

                {/* Main Content Area: Switched by Tab */}
                <main className="flex-1 bg-neutral-950/40 p-12 overflow-y-auto scrollbar-thin relative text-black">
                    <div className="max-w-[850px] mx-auto">
                        {activeTab === "resume" && (
                            <div 
                                className="bg-white rounded-sm shadow-[0_32px_128px_-16px_rgba(0,0,0,0.6)] animate-in slide-in-from-bottom-8 duration-1000 min-h-[1100px]"
                                contentEditable
                                suppressContentEditableWarning
                            >
                                 <PaperPreview 
                                    data={resumeContent} 
                                    templateId={selectedTemplate} 
                                    className="p-12" 
                                />
                            </div>
                        )}

                        {activeTab === "job" && (
                            <div className="bg-card border border-white/10 rounded-2xl p-10 text-foreground animate-in fade-in zoom-in-95 duration-500">
                                <h3 className="text-2xl font-bold mb-6 text-white">Job Description</h3>
                                <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                    {resumeContent.jobDescription || "No description available for this job."}
                                </div>
                            </div>
                        )}

                        {activeTab === "cover" && (
                            <div className="bg-white rounded-sm shadow-2xl p-16 min-h-[1100px] animate-in slide-in-from-bottom-8 duration-1000">
                                <div className="text-black space-y-6">
                                    <p className="font-bold">Subject: Application for {resumeContent.jobTitle} position at {resumeContent.jobCompany}</p>
                                    <p>Dear Hiring Manager,</p>
                                    <p>I am writing to express my strong interest in the {resumeContent.jobTitle} position at {resumeContent.jobCompany}. With my background in {resumeContent.experience?.[0]?.title}, I am confident that I can contribute effectively to your team.</p>
                                    <div className="italic text-gray-400 p-4 border-2 border-dashed border-gray-200 rounded">
                                        Cover Letter Generator coming soon in the next sprint...
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Fixed Bottom: Optimize with AI Button */}
                    {activeTab === "resume" && (
                        <div className="fixed bottom-12 left-[calc(380px+(100%-380px-280px)/2)] -translate-x-1/2 z-30 flex flex-col items-center gap-4">
                            <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center gap-3 text-amber-400 text-xs font-bold shadow-xl backdrop-blur-md">
                            <Zap size={14} className="animate-pulse" />
                            Ready to Boost?
                            </div>
                            <TailorTrigger 
                                jobId={resumeContent.jobId || ""}
                                onComplete={(result) => setResumeContent(result as any)}
                                className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white h-14 px-10 rounded-2xl font-bold shadow-2xl flex items-center gap-3 transition-transform hover:scale-105 active:scale-95"
                            />
                        </div>
                    )}
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
                                    "w-full group rounded-xl border p-2 transition-all text-foreground text-left",
                                    selectedTemplate === id ? "border-[#ff8303] bg-[#ff8303]/5" : "border-white/5 hover:border-white/20"
                                )}
                            >
                                <div className="aspect-[1/1.4] bg-white rounded-sm mb-3 overflow-hidden border border-black/5">
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
