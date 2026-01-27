"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Job, SerializedJob } from "@/features/dashboard/types";
import { X, Calendar, ExternalLink, Wand2, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { SuitabilityBadge } from "@/features/matching/components/suitability-badge";
import { RedZoneList } from "@/features/matching/components/red-zone-list";
import { analyzeJobGaps } from "@/features/matching/actions";
import { GapSchema } from "@/features/matching/schema";
import { updateJobNotes } from "@/features/dashboard/actions";
import { TailorTrigger } from "@/features/tailoring/components/tailor-trigger";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface JobDetailModalProps {
    job: Job | SerializedJob | null;
    isOpen: boolean;
    onClose: () => void;
}

export function JobDetailModal({ job, isOpen, onClose }: JobDetailModalProps) {
    const [gapData, setGapData] = useState<GapSchema | null>(null);
    const [isLoadingGaps, setIsLoadingGaps] = useState(false);
    const [notes, setNotes] = useState("");
    const [isSavingNotes, setIsSavingNotes] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const router = useRouter();

    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isOpen && job) {
            setNotes(job.notes || "");
            loadGaps();
        } else {
            setGapData(null);
            setNotes("");
            setSaveStatus('idle');
        }
    }, [isOpen, job?.id]);

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
        router.push(`/dashboard/resumes?jobId=${job.id}`);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative w-full max-w-4xl max-h-[90vh] bg-neutral-900/90 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="p-6 border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent shrink-0">
                    <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold text-white tracking-tight">{job.title}</h2>
                            <div className="flex items-center gap-3 text-muted-foreground">
                                <span className="font-semibold text-white/90">{job.company}</span>
                                <span className="text-white/20">•</span>
                                <div className="flex items-center gap-1.5 text-xs">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>Posted on {formatPostedDate()}</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-white/5 text-muted-foreground hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex items-center gap-4 mt-6">
                        {typeof score === 'number' && (
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Role Match</span>
                                <SuitabilityBadge score={score} />
                            </div>
                        )}
                        {typeof atsScore === 'number' && (
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Resume Score</span>
                                <div className="bg-white/5 border border-white/10 px-3 py-1 rounded-md text-sm font-bold text-amber-400">
                                    {atsScore}%
                                </div>
                            </div>
                        )}
                        {job.salarySnippet && (
                            <div className="flex flex-col gap-1 pl-4 border-l border-white/10">
                                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Compensation</span>
                                <span className="text-emerald-400 font-bold">{job.salarySnippet}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content Areas (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

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
                            Review Resume
                        </Button>
                        <TailorTrigger
                            jobId={job.id}
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
