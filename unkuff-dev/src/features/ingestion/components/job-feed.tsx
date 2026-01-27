"use client";

import { useState } from "react";
import { hydrateJobAction } from "../actions";
import { Database, ChevronRight, Zap, Loader2, Link as LinkIcon, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export function JobFeed({ jobs }: { jobs: any[] }) {
    return (
        <div className="flex flex-col gap-4">
            <h3 className="text-lg font-medium px-1">Recent Discoveries</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                {jobs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 bg-white/5 rounded-2xl border border-dashed border-white/20">
                        <Database className="h-8 w-8 text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">No jobs found yet. Try a discovery pulse.</p>
                    </div>
                ) : (
                    jobs.map((job) => <JobCard key={job.id} job={job} />)
                )}
            </div>
        </div>
    );
}

function JobCard({ job }: { job: any }) {
    const [hydrating, setHydrating] = useState(false);
    const [isHydrated, setIsHydrated] = useState(
        !!(job.description && job.technographics?.length)
    );

    const handleHydrate = async () => {
        setHydrating(true);
        try {
            const result = await hydrateJobAction(job.id);
            if (result.success) {
                setIsHydrated(true);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setHydrating(false);
        }
    };

    return (
        <div className="group relative flex flex-col gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all hover:bg-white/10">
            <div className="flex justify-between items-start gap-4">
                <div className="flex flex-col gap-1">
                    <h4 className="font-semibold text-lg leading-tight group-hover:text-blue-400 transition-colors uppercase tracking-tight">
                        {job.title}
                    </h4>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <span className="font-medium text-zinc-300">{job.company}</span>
                        <span>•</span>
                        <span>{job.location || "Remote"}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-white/10 text-white/60 tracking-widest uppercase">
                        {job.sourceName}
                    </span>
                    <a
                        href={job.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        <LinkIcon className="h-4 w-4 text-white/50" />
                    </a>
                </div>
            </div>

            {isHydrated && job.technographics && (
                <div className="flex flex-wrap gap-1.5">
                    {job.technographics.map((tech: string) => (
                        <span key={tech} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                            {tech}
                        </span>
                    ))}
                </div>
            )}

            <div className="flex items-center justify-between pt-2">
                <div className="text-sm font-medium text-green-400/80">
                    {job.salarySnippet || "Salary Not Disclosed"}
                </div>

                <button
                    onClick={handleHydrate}
                    disabled={hydrating || isHydrated}
                    className={cn(
                        "flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg transition-all",
                        isHydrated
                            ? "bg-green-500/10 text-green-400 cursor-default"
                            : "bg-white text-black hover:bg-zinc-200 disabled:opacity-50"
                    )}
                >
                    {hydrating ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                    ) : isHydrated ? (
                        <Zap className="h-3 w-3 fill-current" />
                    ) : (
                        <Zap className="h-3 w-3" />
                    )}
                    {hydrating ? "Hydrating..." : isHydrated ? "Deep Dive Complete" : "AI Deep Dive"}
                </button>
            </div>

            <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1 pointer-events-none">
                <ChevronRight className="h-4 w-4 text-white/20" />
            </div>
        </div>
    );
}
