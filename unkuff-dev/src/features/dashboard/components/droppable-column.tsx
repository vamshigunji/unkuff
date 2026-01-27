'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanColumn as IKanbanColumn, SerializedJob } from '../types';
import { DraggableJobCard } from './draggable-job-card';
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Search } from "lucide-react";

interface DroppableColumnProps {
    column: IKanbanColumn<SerializedJob>;
    onOpenJob: (job: SerializedJob) => void;
    onDelete: (jobId: string) => void;
}

/**
 * Droppable Kanban column with sortable job cards
 */
export function DroppableColumn({ column, onOpenJob, onDelete }: DroppableColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: column.id,
    });

    const [discoveryProgress, setDiscoveryProgress] = useState<{ percentage: number; status: string } | null>(null);

    useEffect(() => {
        if (column.id !== 'recommended') return;

        const checkDiscovery = async () => {
            try {
                const res = await fetch("/api/discovery-progress");
                if (res.ok) {
                    const data = await res.json();
                    if (data.status === 'in_progress') {
                        setDiscoveryProgress(data);
                    } else {
                        setDiscoveryProgress(null);
                    }
                }
            } catch (e) {
                setDiscoveryProgress(null);
            }
        };

        checkDiscovery();
        const interval = setInterval(checkDiscovery, 5000);
        return () => clearInterval(interval);
    }, [column.id]);

    // Get all job IDs for sortable context
    const jobIds = column.jobs.map((job) => job.id);

    return (
        <div
            ref={setNodeRef}
            data-testid="droppable-column"
            data-column-id={column.id}
            aria-label={`${column.label} column with ${column.jobs.length} jobs`}
            className={`
                flex flex-col h-full 
                bg-white/[0.03] backdrop-blur-xl
                rounded-2xl border border-white/[0.08] 
                overflow-hidden
                transition-all duration-300
                shadow-[0_4px_16px_rgba(0,0,0,0.2)]
                ${isOver
                    ? 'ring-2 ring-primary/40 border-primary/30 bg-primary/5 scale-[1.01]'
                    : ''
                }
            `}
        >
            {/* Column Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06] shrink-0 bg-white/[0.02]">
                <h2 className="font-bold text-sm text-foreground/80 tracking-wide uppercase font-mono">
                    {column.label}
                </h2>
                <div className={cn(
                    "flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-full text-[11px] font-bold tabular-nums shadow-inner",
                    column.id === 'recommended' ? "bg-primary text-primary-foreground" : 
                    column.id === 'applied' ? "bg-blue-500 text-white" :
                    column.id === 'interviewing' ? "bg-purple-500 text-white" :
                    "bg-emerald-500 text-white"
                )}>
                    {column.jobs.length}
                </div>
            </div>

            {/* Discovery Progress Bar for Recommended Column */}
            {column.id === 'recommended' && discoveryProgress && (
                <div className="px-4 py-3 bg-primary/5 border-b border-white/5 animate-in fade-in slide-in-from-top duration-500">
                    <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                            <Search size={10} className="animate-pulse" />
                            Discovering...
                        </div>
                        <span className="text-[10px] font-bold text-primary">{discoveryProgress.percentage}%</span>
                    </div>
                    <Progress value={discoveryProgress.percentage} className="h-1 bg-white/10" />
                </div>
            )}

            {/* Sortable Job Cards Container */}
            <SortableContext items={jobIds} strategy={verticalListSortingStrategy}>
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                    {column.jobs.map((job) => (
                        <DraggableJobCard
                            key={job.id}
                            job={job}
                            onOpenJob={onOpenJob}
                            onDelete={onDelete}
                        />
                    ))}
                    {column.jobs.length === 0 && !discoveryProgress && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center mb-3">
                                <span className="text-lg opacity-30">📋</span>
                            </div>
                            <p className="text-xs text-muted-foreground/40">No jobs yet</p>
                        </div>
                    )}
                </div>
            </SortableContext>
        </div>
    );
}
