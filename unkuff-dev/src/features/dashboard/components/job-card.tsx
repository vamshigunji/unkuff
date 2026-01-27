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
                "group relative overflow-hidden rounded-2xl bg-glass-md transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 cursor-pointer",
                "hover:bg-white/[0.06] hover:border-white/20 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:translate-y-[-2px]"
            )}
        >
            <div className="p-4 flex flex-col gap-3">
                {/* Header: Icon + Title + Company */}
                <div className="flex items-start gap-3">
                    <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-lg",
                        job.company?.toLowerCase().includes('google') ? "bg-primary shadow-primary/20" :
                        job.company?.toLowerCase().includes('microsoft') ? "bg-blue-500 shadow-blue-500/20" :
                        job.company?.toLowerCase().includes('stripe') ? "bg-emerald-500 shadow-emerald-500/20" :
                        "bg-white/10"
                    )}>
                        {job.company?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm leading-tight text-foreground/90 line-clamp-2 tracking-tight group-hover:text-primary transition-colors">
                            {job.title}
                        </h3>
                        <p className="text-[11px] text-muted-foreground/60 font-medium mt-0.5">
                            {job.company}
                        </p>
                    </div>
                </div>

                {/* Info: Salary & Match */}
                <div className="flex items-center justify-between">
                    {salaryDisplay && (
                        <span className="text-xs font-bold text-foreground/80">
                            {salaryDisplay}
                        </span>
                    )}
                    
                    {typeof jobFitScore === 'number' && (
                        <div className={cn(
                            "px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm",
                            jobFitScore >= 90 ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                            jobFitScore >= 70 ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                            "bg-white/10 text-muted-foreground border border-white/10"
                        )}>
                            {jobFitScore}% Match
                        </div>
                    )}
                </div>
            </div>

            {/* Hover Accent Line */}
            <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
