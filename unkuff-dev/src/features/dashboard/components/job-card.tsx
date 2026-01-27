import { Job, SerializedJob } from "@/features/dashboard/types";
import { Calendar, Sparkles, ExternalLink, Trash2 } from "lucide-react";
import { SuitabilityBadge } from "@/features/matching/components/suitability-badge";
import { SCORE_HIGH_THRESHOLD } from "@/features/matching/constants";
import { cn } from "@/lib/utils";
import { JobDetailModal } from "./job-detail-modal";
import { Button } from "@/components/ui/button";

interface JobCardProps {
    job: Job | SerializedJob;
    onClick?: () => void;
    onDelete?: () => void;
}

/**
 * Premium Job Card - Compact Auto-Height Layout
 * 
 * Renders a compact, auto-height job card with key details like
 * title, company, posted date, salary, and suitability scores.
 * Includes actions for applying and viewing more details.
 * 
 * The card has a glassmorphism effect with a gradient background,
 * border, and backdrop blur. It features hover effects for a
 * subtle lift and accent line.
 * 
 * It's designed to be used within a draggable context (see
 * DraggableJobCard) and can be clicked to open a modal with
 * more detailed information about the job.
 */
interface JobMetadata {
    score?: number;
    atsScore?: number;
    [key: string]: unknown;
}

export function JobCard({ job, onClick, onDelete }: JobCardProps) {
    const metadata = (job.metadata || {}) as JobMetadata;
    const jobFitScore = metadata.score;
    const atsScore = metadata.atsScore;
    const isHighFit = typeof jobFitScore === 'number' && jobFitScore >= SCORE_HIGH_THRESHOLD;
    const isHighAts = typeof atsScore === 'number' && atsScore >= 95;

    // Format salary display
    const formatSalary = () => {
        if (job.salarySnippet) return job.salarySnippet;
        if (job.minSalary || job.maxSalary) {
            const currency = job.salaryCurrency || 'USD';
            const symbol = currency === 'USD' ? '$' : currency;
            const min = job.minSalary ? `${symbol}${(job.minSalary / 1000).toFixed(0)}k` : null;
            const max = job.maxSalary ? `${symbol}${(job.maxSalary / 1000).toFixed(0)}k` : null;
            if (min && max) return `${min} – ${max}`;
            if (min) return `${min}+`;
            if (max) return `Up to ${max}`;
        }
        return null;
    };

    // Format posted date
    const formatPostedDate = () => {
        const posted = job.postedAt;
        if (!posted) return null;

        const date = typeof posted === 'string' ? new Date(posted) : posted;
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
        return `${Math.floor(diffDays / 30)}mo ago`;
    };

    const salaryDisplay = formatSalary();
    const postedDisplay = formatPostedDate();
    const hasScores = typeof jobFitScore === 'number' || typeof atsScore === 'number';

    const handleApply = (e: React.MouseEvent) => {
        e.stopPropagation();
        const url = job.applyUrl || job.sourceUrl;
        if (url) window.open(url, '_blank');
    };

    const handleCardClick = () => {
        onClick?.();
    };

    return (
        <article
            tabIndex={0}
            onClick={handleCardClick}
            className={cn(
                "group relative overflow-hidden rounded-xl bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/[0.08] backdrop-blur-xl transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-active-blue/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer",
                "hover:from-white/[0.12] hover:to-white/[0.06] hover:border-white/[0.15] hover:shadow-[0_8px_32px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.05)] hover:translate-y-[-2px]"
            )}
        >
            <div className="p-3">
                {/* Header: Title + Company + Posted Date */}
                <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[13px] leading-tight text-foreground/95 line-clamp-2 tracking-tight group-hover:text-white transition-colors">
                            {job.title}
                        </h3>
                        <p className="text-[11px] text-muted-foreground/70 truncate font-medium mt-0.5">
                            {job.company}
                        </p>
                    </div>

                    {postedDisplay && (
                        <div className="shrink-0 flex items-center gap-1 text-[9px] text-muted-foreground/50">
                            <Calendar className="w-2.5 h-2.5" />
                            <span>{postedDisplay}</span>
                        </div>
                    )}
                </div>

                {/* Scores: Inline badges */}
                {hasScores && (
                    <div className="flex items-center gap-1.5 mb-2">
                        {typeof jobFitScore === 'number' && (
                            <SuitabilityBadge score={jobFitScore} />
                        )}

                        {typeof atsScore === 'number' && (
                            <div
                                className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold
                                    ${isHighAts
                                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                                        : 'bg-white/[0.04] text-foreground/70 border border-white/[0.06]'
                                    }`}
                            >
                                <span className="font-bold">{atsScore}%</span>
                                <span className="uppercase tracking-wider opacity-70">Resume</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Salary & Actions */}
                <div className="flex items-center justify-between border-t border-white/[0.06] pt-2 mt-1">
                    {salaryDisplay ? (
                        <span className="text-[12px] font-semibold text-emerald-400">{salaryDisplay}</span>
                    ) : <span></span>}

                    <div className="flex items-center gap-2">
                        {isHighFit && (
                            <button className="flex items-center gap-1 text-[10px] text-amber-400/80 hover:text-amber-400 transition-colors">
                                <Sparkles className="w-3 h-3" />
                                <span>Analysis</span>
                            </button>
                        )}
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-[10px] bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 text-white/50 gap-1 rounded-lg border border-white/5"
                            onClick={handleApply}
                        >
                            Apply
                            <ExternalLink className="w-2.5 h-2.5" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Hover Accent Line */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-active-blue/0 via-active-blue/60 to-active-blue/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </article>
    );
}

export function JobCardSkeleton() {
    return (
        <div className="rounded-xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.05] p-3">
            <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 space-y-1">
                    <div className="h-3.5 bg-white/10 rounded w-3/4 animate-pulse" />
                    <div className="h-2.5 bg-white/5 rounded w-1/2 animate-pulse" />
                </div>
                <div className="h-2.5 bg-white/5 rounded w-10 animate-pulse" />
            </div>
            <div className="flex gap-1.5 mb-2">
                <div className="h-5 bg-white/[0.04] rounded w-14 animate-pulse" />
                <div className="h-5 bg-white/[0.04] rounded w-14 animate-pulse" />
            </div>
            <div className="pt-2 border-t border-white/5">
                <div className="h-3 bg-white/5 rounded w-20 animate-pulse" />
            </div>
        </div>
    );
}
