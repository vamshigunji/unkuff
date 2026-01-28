"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Job, SerializedJob } from "@/features/dashboard/types";
import { X, Calendar, ExternalLink, Wand2, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { SuitabilityBadge } from "@/features/matching/components/suitability-badge";
import { RedZoneList } from "@/features/matching/components/red-zone-list";
import { analyzeJobGaps, generateKeywordsAction, generateATSReportAction } from "@/features/matching/actions";
import { GapSchema } from "@/features/matching/schema";
import { KeywordList } from "@/features/matching/components/keyword-list";
import { ATSReportView } from "@/features/matching/components/ats-report-view";
import { updateJobNotes } from "@/features/dashboard/actions";
import { TailorTrigger } from "@/features/tailoring/components/tailor-trigger";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Hash, FileCode2 } from "lucide-react";

interface JobDetailModalProps {
    job: Job | SerializedJob | null;
    isOpen: boolean;
    onClose: () => void;
}

export function JobDetailModal({ job, isOpen, onClose }: JobDetailModalProps) {
    const [gapData, setGapData] = useState<GapSchema | null>(null);
    const [keywords, setKeywords] = useState<any>(null);
    const [atsReport, setAtsReport] = useState<any>(null);
    const [isLoadingGaps, setIsLoadingGaps] = useState(false);
    const [isLoadingKeywords, setIsLoadingKeywords] = useState(false);
    const [isLoadingATS, setIsLoadingATS] = useState(false);
    const [notes, setNotes] = useState("");
    const [isSavingNotes, setIsSavingNotes] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [isNavigating, setIsNavigating] = useState(false);
    const router = useRouter();

    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isOpen && job) {
            setNotes(job.notes || "");
            loadGaps();
            loadKeywords();
        } else {
            setGapData(null);
            setKeywords(null);
            setAtsReport(null);
            setNotes("");
            setSaveStatus('idle');
        }
    }, [isOpen, job?.id]);

    const loadKeywords = async () => {
        if (!job) return;
        setIsLoadingKeywords(true);
        try {
            const res = await generateKeywordsAction(job.id);
            if (res.data) setKeywords(res.data);
        } catch (err) {
            console.error("Failed to load keywords", err);
        } finally {
            setIsLoadingKeywords(false);
        }
    };

    const handleGenerateATS = async () => {
        if (!job) return;
        setIsLoadingATS(true);
        try {
            // In a real app, we'd fetch the latest tailored resume content for this job
            const resumeContent = "Simulated resume content based on profile"; 
            const res = await generateATSReportAction(job.id, resumeContent);
            if (res.data) setAtsReport(res.data);
        } catch (err) {
            console.error("Failed to generate ATS report", err);
        } finally {
            setIsLoadingATS(false);
        }
    };

    const loadGaps = async () => {
        if (!job) return;
        setIsLoadingGaps(true);
        try {
            const res = await analyzeJobGaps(job.id);
            if (res.data) {
                setGapData(res.data);
            }
        } catch (err) {
            console.error("Failed to load gaps", err);
        } finally {
            setIsLoadingGaps(false);
        }
    };

    const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newNotes = e.target.value;
        setNotes(newNotes);
        setSaveStatus('saving');

        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

        saveTimeoutRef.current = setTimeout(async () => {
            if (!job) return;
            try {
                const res = await updateJobNotes(job.id, newNotes);
                if (res.data) {
                    setSaveStatus('saved');
                    setTimeout(() => setSaveStatus('idle'), 2000);
                } else {
                    setSaveStatus('error');
                }
            } catch (err) {
                setSaveStatus('error');
            }
        }, 1000);
    };

    // Handle Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen || !job) return null;

    const metadata = (job.metadata || {}) as any;
    const score = metadata.score;
    const atsScore = metadata.atsScore;

    const formatPostedDate = () => {
        const posted = job.postedAt;
        if (!posted) return null;
        const date = typeof posted === 'string' ? new Date(posted) : posted;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const handleApply = () => {
        const url = job.applyUrl || job.sourceUrl;
        if (url) window.open(url, '_blank');
    };

    const handleReviewResume = () => {
        // Reroute to resume reviewer/editor
        // Passing job ID to potentially auto-tailor or context-aware review
        console.log("[JobDetailModal] Immediate Editor Ingress for jobId:", job.id);
        onClose(); // Close modal first
        setTimeout(() => {
            router.push(`/dashboard/resumes?jobId=${job.id}&mode=editor`);
        }, 100);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative w-full max-w-4xl max-h-[90vh] bg-glass-lg border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="p-8 border-b border-white/5 bg-white/[0.02] shrink-0">
                    <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1.5">
                            <h2 className="text-3xl font-bold text-white tracking-tight leading-tight">{job.title}</h2>
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <span className="font-bold text-lg text-white/90">{job.company}</span>
                                <span className="text-white/20">•</span>
                                <div className="flex items-center gap-1.5 text-xs font-medium">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>Posted {formatPostedDate()}</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-3 rounded-2xl hover:bg-white/10 text-muted-foreground hover:text-white transition-all border border-transparent hover:border-white/10"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex items-center gap-6 mt-8">
                        {typeof score === 'number' && (
                            <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-black">Suitability Score</span>
                                <div className={cn(
                                    "px-4 py-1.5 rounded-full text-sm font-black shadow-lg",
                                    score >= 90 ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-emerald-500/10" :
                                    score >= 70 ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-amber-500/10" :
                                    "bg-white/5 text-muted-foreground border border-white/10"
                                )}>
                                    {score}% Match
                                </div>
                            </div>
                        )}
                        {typeof atsScore === 'number' && (
                            <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-black">ATS Optimization</span>
                                <div className="bg-amber-500/20 border border-amber-500/30 px-4 py-1.5 rounded-full text-sm font-black text-amber-400 shadow-lg shadow-amber-500/10">
                                    {atsScore}% Optimized
                                </div>
                            </div>
                        )}
                        {job.salarySnippet && (
                            <div className="flex flex-col gap-1.5 pl-6 border-l border-white/10">
                                <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-black">Compensation</span>
                                <span className="text-white font-black text-lg">{job.salarySnippet}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content Areas (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-thin">

                    {/* Job Description */}
                    <section className="space-y-3">
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-active-blue" />
                            <h3 className="text-sm font-bold uppercase tracking-widest text-white/70">Job Description</h3>
                        </div>
                        <div className="prose prose-invert prose-sm max-w-none text-muted-foreground leading-relaxed">
                            {job.description ? (
                                <div dangerouslySetInnerHTML={{ __html: job.descriptionHtml || job.description.replace(/\n/g, '<br/>') }} />
                            ) : (
                                <p>{job.snippet || "No description available."}</p>
                            )}
                        </div>
                    </section>

                    {/* Keywords & ATS Analysis */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Keyword Extractor */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Hash className="w-4 h-4 text-active-blue" />
                                <h3 className="text-sm font-bold uppercase tracking-widest text-white/70">Keyword Extractor</h3>
                            </div>
                            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
                                <KeywordList keywords={keywords} isLoading={isLoadingKeywords} />
                            </div>
                        </section>

                        {/* ATS Code Generator */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FileCode2 className="w-4 h-4 text-amber-400" />
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-white/70">ATS Score Gen</h3>
                                </div>
                                {!atsReport && !isLoadingATS && (
                                    <Button 
                                        size="sm" 
                                        onClick={handleGenerateATS}
                                        className="h-7 text-[10px] bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 rounded-md"
                                    >
                                        Generate Report
                                    </Button>
                                )}
                            </div>
                            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 min-h-[100px]">
                                <ATSReportView report={atsReport} isLoading={isLoadingATS} />
                            </div>
                        </section>
                    </div>

                    {/* Gap Analysis */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-400" />
                            <h3 className="text-sm font-bold uppercase tracking-widest text-white/70">Gap Analysis</h3>
                        </div>
                        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
                            <RedZoneList gapAnalysis={gapData} isLoading={isLoadingGaps} />
                        </div>
                    </section>

                    {/* Candidate Notes */}
                    <section className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Edit3 className="w-4 h-4 text-emerald-400" />
                                <h3 className="text-sm font-bold uppercase tracking-widest text-white/70">Your Notes</h3>
                            </div>
                            <div className="flex items-center gap-2 text-[11px]">
                                {saveStatus === 'saving' && (
                                    <span className="text-muted-foreground flex items-center gap-1">
                                        <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                                    </span>
                                )}
                                {saveStatus === 'saved' && (
                                    <span className="text-emerald-400 flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> Saved
                                    </span>
                                )}
                                {saveStatus === 'error' && (
                                    <span className="text-red-400 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" /> Save failed
                                    </span>
                                )}
                            </div>
                        </div>
                        <textarea
                            value={notes}
                            onChange={handleNotesChange}
                            placeholder="Add your insights, interview notes, or colleague feedback here..."
                            className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-active-blue/50 focus:bg-white/10 transition-all resize-none placeholder:text-muted-foreground/30"
                        />
                    </section>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-white/5 bg-white/[0.02] shrink-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={handleReviewResume}
                            variant="outline"
                            className="bg-white/5 border-white/10 hover:bg-white/10 text-white gap-2 h-11 px-6 rounded-xl"
                        >
                            <FileText className="w-4 h-4" />
                            Edit Resume
                        </Button>
                        <TailorTrigger
                            jobId={job.id}
                            variant="secondary"
                            onComplete={() => {
                                // Potentially update the modal with new analysis
                                loadGaps();
                            }}
                        />
                    </div>

                    <Button
                        onClick={handleApply}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2 h-11 px-8 rounded-xl font-bold shadow-lg shadow-emerald-500/20"
                    >
                        Apply to This Job
                        <ExternalLink className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

// Minimal icons for internal use
function Edit3(props: any) {
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
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
    )
}
