import { cn } from "@/lib/utils";
import { SCORE_HIGH_THRESHOLD, SCORE_GOOD_THRESHOLD } from "../constants";

interface SuitabilityBadgeProps {
    score: number;
    className?: string;
    showLabel?: boolean;
}

export function SuitabilityBadge({ score, className, showLabel = true }: SuitabilityBadgeProps) {
    let colorClass = "bg-white/[0.04] text-muted-foreground border-white/[0.06]"; // Neutral < 70


    if (score >= SCORE_HIGH_THRESHOLD) {
        colorClass = "bg-emerald-500/15 text-emerald-400 border-emerald-500/20";
    } else if (score >= SCORE_GOOD_THRESHOLD) {
        colorClass = "bg-blue-500/15 text-blue-400 border-blue-500/20";
    }

    return (
        <div className={cn(
            "flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold border",
            colorClass,
            className
        )}>
            <span className="font-bold">{score}%</span>
            {showLabel && <span className="uppercase tracking-wider opacity-70">Match</span>}
        </div>
    );
}
