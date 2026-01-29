"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
    Briefcase,
    Eye,
    EyeOff,
    Search,
    AlertCircle,
    ScanText,
    RefreshCw as RefreshIcon
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
    const [isRecruiterView, setIsRecruiterView] = useState(false);
    const router = useRouter();
    
    // [STATE] Local content management
    const [resumeContent, setResumeContent] = useState<ResumeData | null>(initialData);
    const [isLoadingKeywords, setIsLoadingKeywords] = useState(!initialData?.keywords);
    const [isEvaluating, setIsEvaluating] = useState(false);
    const editorRef = useRef<HTMLDivElement>(null);

    // Sync state when initialData changes
    useEffect(() => {
        if (initialData) {
            console.log("[AIResumeEditor] Syncing state with new job context:", initialData.jobCompany);
            setResumeContent(initialData);
            setIsLoadingKeywords(!initialData.keywords);
        }
    }, [initialData]);

    const handleGenerateAnalysis = async () => {
        setIsLoadingKeywords(true);
        router.push(`/dashboard?analyze=${resumeContent?.jobId}`);
    };

    const handleClose = () => {
        router.push('/dashboard');
    };

    // [PHASE 2] Manual Scan Scorer (TDD)
    const handleScanResume = async () => {
        if (!resumeContent?.jobId || !editorRef.current) return;
        
        setIsEvaluating(true);
        // [PHASE 2] Clear keywords during scan to show loading state
        setResumeContent(prev => prev ? { ...prev, keywords: null } : null);
        setIsLoadingKeywords(true);
        
        console.log("[AIResumeEditor] Triggering manual UHS scan...");
        
        try {
            // Extract raw text from the contentEditable area
            let rawText = editorRef.current.innerText || "";
            
            // [PHASE 2] Robust Fallback: If DOM extraction is thin, use state-based reconstruction
            if (rawText.length < 100) {
                console.log("[AIResumeEditor] DOM text extraction too small, using state fallback...");
                rawText = `
                    ${resumeContent.contact.fullName}
                    ${resumeContent.summary}
                    ${resumeContent.experience.map(e => `${e.company} | ${e.title}\n${e.description}\n${e.accomplishments.join("\n")}`).join("\n\n")}
                    ${resumeContent.education.map(e => `${e.institution} | ${e.degree}`).join("\n")}
                    SKILLS: ${resumeContent.skills.join(", ")}
                `;
            }

            const res = await fetch("/api/matching/evaluate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    content: rawText, 
                    jobId: resumeContent.jobId 
                })
            });

            if (!res.ok) throw new Error("Scan failed");
            
            const data = await res.json();
            console.log("[AIResumeEditor] Scan complete. New UHS score:", data.score);
            console.log("[AIResumeEditor] Found Keywords:", data.foundKeywords.length);
            
            // Strictly update the local state with new analysis
            setResumeContent(prev => {
                if (!prev) return null;
                return { 
                    ...prev, 
                    atsScore: data.score, 
                    keywords: { 
                        matched: data.foundKeywords || [], 
                        missing: data.missingKeywords || []
                    } 
                };
            });
            
            setIsLoadingKeywords(false);
        } catch (e) {
            console.error("Manual Scan failed:", e);
        } finally {
            setIsEvaluating(false);
        }
    };

    if (!resumeContent || !hasProfile) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 bg-background text-foreground">
                <div className="p-4 rounded-full bg-white/5 border border-white/10">
                    <FileText className="w-12 h-12 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-bold">No Resume Data Found</h2>
                <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
            </div>
        );
    }

    const matchScore = resumeContent.atsScore || 0;

    return (
        <div className="fixed inset-0 z-50 bg-background flex flex-col animate-in fade-in duration-500 overflow-hidden text-foreground">
            {/* Top Navigation Bar with Editor Tools */}
            <header className="h-[72px] border-b border-white/10 flex items-center justify-between px-8 bg-card shrink-0 z-20">
                <div className="flex items-center gap-6 h-full">
                    {/* Tabs */}
                    <div className="flex h-full border-r border-white/10 pr-6">
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

                    {/* [PHASE 2] Recruiter Eye Toggle */}
                    <div className="flex items-center gap-2 border-l border-white/10 pl-6">
                        <button 
                            onClick={() => setIsRecruiterView(!isRecruiterView)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                                isRecruiterView 
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]" 
                                    : "bg-white/5 text-muted-foreground border border-white/5 hover:border-white/20"
                            )}
                        >
                            {isRecruiterView ? <Eye size={14} /> : <EyeOff size={14} />}
                            Recruiter Eye
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
                {/* Left Sidebar: Heatmap Analysis */}
                <aside className="w-[380px] border-r border-white/10 bg-card flex flex-col shrink-0 overflow-y-auto scrollbar-hide">
                    <div className="p-8 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "relative w-20 h-20 shrink-0 flex items-center justify-center transition-all duration-700",
                                isEvaluating && "scale-105 opacity-50 blur-sm"
                            )}>
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/5" />
                                    <circle cx="40" cy="40" r="36" stroke="#ff8303" strokeWidth="4" fill="transparent" strokeDasharray="226.2" strokeDashoffset={226.2 * (1 - matchScore / 100)} strokeLinecap="round" className="transition-all duration-1000" />
                                </svg>
                                <span className="absolute text-2xl font-mono font-bold text-[#ff8303]">{matchScore}</span>
                            </div>
                            <div className="space-y-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-bold text-white leading-tight truncate">
                                        {resumeContent.jobCompany || "Target Company"}
                                    </h2>
                                    <button 
                                        onClick={handleScanResume}
                                        disabled={isEvaluating}
                                        className={cn(
                                            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/5 text-amber-500 hover:bg-white/10 transition-all active:scale-95 shadow-sm",
                                            isEvaluating && "opacity-50"
                                        )}
                                        title="Trigger UHS Scan"
                                    >
                                        <ScanText size={14} className={cn(isEvaluating && "animate-pulse")} />
                                        <span className="text-[10px] font-black uppercase tracking-wider">Scan</span>
                                    </button>
                                </div>
                                <p className="text-sm text-muted-foreground truncate font-medium">
                                    {resumeContent.jobTitle || "Target Role"}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/5">
                            <Briefcase className="w-4 h-4 text-muted-foreground" />
                            <span className="text-xs font-bold uppercase tracking-tight text-white/80">Surgical Matching v2.1</span>
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

                    {/* Heatmap Content */}
                    <div className="p-8 space-y-8 text-foreground">
                                {skillsTab === "skills" && (
                            <section className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-bold uppercase tracking-widest text-white">Match Heatmap</span>
                                        <Info size={12} className="text-muted-foreground" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {resumeContent.keywords ? (
                                        <>
                                            {resumeContent.keywords.matched.length === 0 && resumeContent.keywords.missing.length === 0 ? (
                                                <div className="text-center py-6 border border-dashed border-white/10 rounded-xl bg-white/5">
                                                    <AlertCircle className="w-5 h-5 text-muted-foreground mx-auto mb-2" />
                                                    <p className="text-[10px] text-muted-foreground">No significant keywords detected.</p>
                                                    <p className="text-[9px] text-muted-foreground/60">Try adding more details to your resume.</p>
                                                </div>
                                            ) : (
                                                <>
                                                    {resumeContent.keywords.matched.map((name: string, i: number) => (
                                                        <div key={`matched-${i}`} className="flex items-center justify-between p-3 rounded-xl border border-emerald-500/10 bg-emerald-500/[0.03] transition-all group hover:bg-emerald-500/10">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                                                    <Check size={10} className="text-emerald-500" />
                                                                </div>
                                                                <span className="text-xs font-medium text-emerald-100/90">{name}</span>
                                                            </div>
                                                            <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">MATCH</span>
                                                        </div>
                                                    ))}
                                                    {resumeContent.keywords.missing.map((name: string, i: number) => (
                                                        <div key={`missing-${i}`} className="flex items-center justify-between p-3 rounded-xl border border-red-500/20 bg-red-500/[0.03] transition-all group hover:bg-red-500/10">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center">
                                                                    <X size={10} className="text-red-400" />
                                                                </div>
                                                                <span className="text-xs font-medium text-red-100/90">{name}</span>
                                                            </div>
                                                            <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-red-400/20 text-red-400">MISSING</span>
                                                        </div>
                                                    ))}
                                                </>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-center py-10 space-y-3">
                                            <div className={cn("flex flex-col items-center gap-2", isLoadingKeywords && "animate-pulse")}>
                                                <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                                    <Search className="w-4 h-4 text-muted-foreground" />
                                                </div>
                                                <p className="text-[10px] text-muted-foreground italic">Initializing heatmap...</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        {skillsTab === "searchability" && (
                            <section className="space-y-6">
                                <div className="space-y-2">
                                    <span className="text-[11px] font-bold uppercase tracking-widest text-white">ATS Readability</span>
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-muted-foreground">Formatting Score</span>
                                            <span className="text-sm font-bold text-amber-500">{resumeContent.atsScore ? Math.min(95, resumeContent.atsScore + 5) : 85}%</span>
                                        </div>
                                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                            <div className="bg-amber-500 h-full transition-all duration-1000" style={{ width: `${resumeContent.atsScore ? Math.min(95, resumeContent.atsScore + 5) : 85}%` }} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                                        <Check size={14} className="text-emerald-500" />
                                        <span className="text-xs font-medium text-emerald-50/80">Section headers detectable</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                                        <Check size={14} className="text-emerald-500" />
                                        <span className="text-xs font-medium text-emerald-50/80">Contact info identified</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                                        <Info size={14} className="text-blue-400" />
                                        <span className="text-xs font-medium text-white/80">Standard font used</span>
                                    </div>
                                </div>
                            </section>
                        )}

                        {skillsTab === "tips" && (
                            <section className="space-y-4">
                                <span className="text-[11px] font-bold uppercase tracking-widest text-white">UHS Optimization Tips</span>
                                <div className="space-y-3">
                                    {resumeContent.keywords?.missing && resumeContent.keywords.missing.length > 0 ? (
                                        <>
                                            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 space-y-2">
                                                <div className="flex items-center gap-2 text-blue-400">
                                                    <Sparkles size={14} />
                                                    <span className="text-[10px] font-bold uppercase">Quick Win</span>
                                                </div>
                                                <p className="text-xs text-white/90 leading-relaxed">
                                                    Integrate critical missing keywords like <span className="text-blue-400 font-bold">"{resumeContent.keywords.missing[0]}"</span> and <span className="text-blue-400 font-bold">"{resumeContent.keywords.missing[1] || "technical requirements"}"</span> into your summary or experience section.
                                                </p>
                                            </div>
                                            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                                                <p className="text-xs text-white/80 leading-relaxed italic">
                                                    "Quantifying your impact at {resumeContent.experience?.[0]?.company || 'previous roles'} using metrics related to {resumeContent.keywords.matched[0] || 'core skills'} would significantly boost your score."
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center py-10 opacity-50">
                                            <p className="text-[10px] italic">Scan your resume to generate tailored tips.</p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}
                    </div>
                </aside>

                {/* Main Content Area: Now with Recruiter Eye Toggle */}
                <main className="flex-1 bg-neutral-950/40 p-12 overflow-y-auto scrollbar-thin relative text-black">
                    <div className="max-w-[850px] mx-auto">
                        {activeTab === "resume" && (
                            <div className="relative group">
                                {/* [PHASE 2] The Recruiter Eye Overlay */}
                                {isRecruiterView && (
                                    <div className="absolute inset-0 z-10 bg-[#0a0a0a] rounded-sm p-16 font-mono text-[13px] leading-relaxed text-emerald-500/90 overflow-y-auto shadow-2xl border border-emerald-500/20 animate-in fade-in duration-300">
                                        <div className="flex items-center gap-2 mb-8 text-emerald-500/40 border-b border-emerald-500/10 pb-4">
                                            <Briefcase size={14} />
                                            <span className="uppercase tracking-[0.2em] font-black">ATS PARSER OUTPUT_v4.2</span>
                                        </div>
                                        <pre className="whitespace-pre-wrap break-words">
                                            {`RAW_DATA_EXTRACTION_BUFFER:\n\n`}
                                            {resumeContent.contact.fullName.toUpperCase()}\n
                                            {resumeContent.contact.email} | {resumeContent.contact.location || "USA"}\n\n
                                            PROFESSIONAL_SUMMARY:\n
                                            {resumeContent.summary}\n\n
                                            EXPERIENCE_STREAM:\n
                                            {resumeContent.experience.map(e => `[${e.company}] ${e.title}\n${e.description}\n- ${e.accomplishments.join('\n- ')}`).join('\n\n')}\n\n
                                            SKILLS_VECTOR:\n
                                            {resumeContent.skills.join(' | ')}\n\n
                                            EDUCATION_BLOB:\n
                                            {resumeContent.education.map(ed => `${ed.institution}: ${ed.degree}`).join('\n')}
                                        </pre>
                                    </div>
                                )}

                                <div 
                                    ref={editorRef}
                                    className={cn(
                                        "bg-white rounded-sm shadow-[0_32px_128px_-16px_rgba(0,0,0,0.6)] animate-in slide-in-from-bottom-8 duration-1000 min-h-[1100px] transition-all duration-500",
                                        isRecruiterView && "blur-xl scale-[0.98] grayscale opacity-50"
                                    )}
                                    contentEditable={!isRecruiterView}
                                    suppressContentEditableWarning
                                >
                                     <PaperPreview 
                                        data={resumeContent} 
                                        templateId={selectedTemplate} 
                                        className="p-12" 
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === "job" && (
                            <div className="bg-card border border-white/10 rounded-2xl p-10 text-foreground animate-in fade-in zoom-in-95 duration-500">
                                <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
                                    <Briefcase className="text-primary" />
                                    Job Description
                                </h3>
                                <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap font-sans">
                                    {resumeContent.jobDescription || "No description available for this job."}
                                </div>
                            </div>
                        )}

                        {activeTab === "cover" && (
                            <div className="bg-white rounded-sm shadow-2xl p-16 min-h-[1100px] animate-in slide-in-from-bottom-8 duration-1000 text-black">
                                <div className="space-y-6 max-w-2xl mx-auto">
                                    <p className="font-bold border-b border-black/5 pb-4">Subject: Application for {resumeContent.jobTitle} position at {resumeContent.jobCompany}</p>
                                    <p>Dear Hiring Manager,</p>
                                    <p>I am writing to express my strong interest in the {resumeContent.jobTitle} position at {resumeContent.jobCompany}. With my background in {resumeContent.experience?.[0]?.title}, I am confident that I can contribute effectively to your team.</p>
                                    <div className="italic text-gray-400 p-8 border-4 border-dashed border-gray-100 rounded-2xl flex flex-col items-center gap-4 mt-20">
                                        <Sparkles className="text-gray-200 w-8 h-8" />
                                        <span className="font-bold text-gray-300">Cover Letter Generator coming in Phase 3</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Fixed Bottom: Generate with AI Button */}
                    {activeTab === "resume" && !isRecruiterView && (
                        <div className="fixed bottom-12 left-[calc(380px+(100%-380px-280px)/2)] -translate-x-1/2 z-30 flex flex-col items-center gap-4">
                            <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center gap-3 text-blue-400 text-xs font-bold shadow-xl backdrop-blur-md">
                            <Zap size={14} className="animate-pulse" />
                            Level Up with AI?
                            </div>
                            <TailorTrigger 
                                jobId={resumeContent.jobId || ""}
                                label="Generate with AI"
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
                                    <div className="h-1/2 h-2 bg-neutral-100 ml-4" />
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

function RefreshCw(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 2v6h-6" />
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
            <path d="M3 22v-6h6" />
            <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
        </svg>
    )
}
