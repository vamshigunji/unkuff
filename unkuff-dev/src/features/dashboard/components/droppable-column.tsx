'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanColumn as IKanbanColumn, SerializedJob } from '../types';
import { DraggableJobCard } from './draggable-job-card';

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
                bg-gradient-to-b from-white/[0.04] to-white/[0.02] 
                rounded-2xl border border-white/[0.06] 
                overflow-hidden
                transition-all duration-200
                ${isOver
                    ? 'ring-2 ring-active-blue/40 border-active-blue/30 bg-active-blue/5'
                    : ''
                }
            `}
        >
            {/* Column Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.06] shrink-0 bg-white/[0.02]">
                <h2 className="font-semibold text-sm text-foreground/90 tracking-tight">
                    {column.label}
                </h2>
                <span className="text-[11px] bg-white/[0.08] px-2.5 py-1 rounded-full text-foreground/50 font-medium tabular-nums">
                    {column.jobs.length}
                </span>
            </div>

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
                    {column.jobs.length === 0 && (
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
