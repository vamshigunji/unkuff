"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, Info } from "lucide-react";

interface ATSReportViewProps {
    report: {
        score: number;
        keywordMatchRate: number;
        formattingScore: number;
        foundKeywords: string[];
        missingKeywords: string[];
        recommendations: string[];
        atsCode: string;
    } | null;
    isLoading?: boolean;
}

export function ATSReportView({ report, isLoading }: ATSReportViewProps) {
    if (isLoading) {
        return (
            <div className="space-y-4 animate-pulse">
                <div className="h-12 bg-white/10 rounded-2xl w-full" />
                <div className="grid grid-cols-2 gap-4">
                    <div className="h-20 bg-white/10 rounded-2xl" />
                    <div className="h-20 bg-white/10 rounded-2xl" />
                </div>
            </div>
        );
    }

    if (!report) {
        return <p className="text-xs text-muted-foreground italic">No ATS report generated yet.</p>;
    }

    return (
        <div className="space-y-6">
            {/* Score Overview */}
            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl">
                <div className="space-y-1">
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">ATS Score</span>
                    <div className="text-3xl font-bold text-white">{report.score}%</div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] text-muted-foreground font-mono uppercase">ATS CODE</div>
                    <div className="text-sm font-mono text-active-blue font-bold">{report.atsCode}</div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
                <MetricCard 
                    label="Keyword Match" 
                    value={`${report.keywordMatchRate}%`} 
                    icon={CheckCircle2}
                    color="text-emerald-400"
                />
                <MetricCard 
                    label="Formatting" 
                    value={`${report.formattingScore}%`} 
                    icon={Info}
                    color="text-active-blue"
                />
            </div>

            {/* Keyword Analysis */}
            <div className="space-y-4">
                <div>
                    <h4 className="text-xs font-bold text-white/50 uppercase mb-2">Found Keywords</h4>
                    <div className="flex flex-wrap gap-1.5">
                        {report.foundKeywords.map((k, i) => (
                            <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                {k}
                            </span>
                        ))}
                    </div>
                </div>
                <div>
                    <h4 className="text-xs font-bold text-white/50 uppercase mb-2">Missing Keywords</h4>
                    <div className="flex flex-wrap gap-1.5">
                        {report.missingKeywords.map((k, i) => (
                            <span key={i} className="text-[11px] px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                                {k}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recommendations */}
            <div className="space-y-2">
                <h4 className="text-xs font-bold text-white/50 uppercase">Recommendations</h4>
                <ul className="space-y-1.5">
                    {report.recommendations.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                            <span>{r}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

function MetricCard({ label, value, icon: Icon, color }: any) {
    return (
        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
                <Icon className={cn("w-3.5 h-3.5", color)} />
                <span className="text-[10px] uppercase font-bold tracking-wider">{label}</span>
            </div>
            <div className="text-xl font-bold text-white">{value}</div>
        </div>
    );
}
