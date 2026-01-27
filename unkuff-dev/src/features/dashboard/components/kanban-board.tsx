'use client';

import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import { KanbanColumn as IKanbanColumn, KanbanStatus, SerializedJob } from '../types';
import { DroppableColumn } from './droppable-column';
import { DragOverlayJobCard } from './draggable-job-card';
import { useKanbanDnd } from '../hooks/use-kanban-dnd';
import { updateJobStatus, deleteJob } from '../actions';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useId } from 'react';
import { JobDetailModal } from './job-detail-modal';

interface KanbanBoardProps {
    initialData: IKanbanColumn<SerializedJob>[];
}

/**
 * Kanban Board with full drag-and-drop support
 */
export function KanbanBoard({ initialData }: KanbanBoardProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [selectedJob, setSelectedJob] = useState<SerializedJob | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const dndContextId = useId();

    // Wait for client-side hydration before rendering DndContext
    // This prevents hydration mismatch with dnd-kit's auto-generated IDs
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Server Action handler for status updates
    const handleMoveJob = async (jobId: string, toStatus: KanbanStatus) => {
        const result = await updateJobStatus(jobId, toStatus);
        return result;
    };

    const {
        columns,
        activeJob,
        sensors,
        handleDragStart,
        handleDragEnd,
        handleDragCancel,
        removeJob,
        addJob,
    } = useKanbanDnd(initialData, handleMoveJob);

    const handleDeleteJob = async (jobId: string) => {
        const jobToDelete = columns.flatMap(c => c.jobs).find(j => j.id === jobId);
        if (!jobToDelete) return;

        const sourceColumn = jobToDelete.status;

        // Optimistically remove the job from the UI
        removeJob(jobId);

        // Call the server action to delete the job
        const result = await deleteJob(jobId);

        // Rollback if the server action failed
        if (result.error) {
            addJob(jobToDelete, sourceColumn);
            console.error('Failed to delete job:', result.error);
        }
    };

    // Handle deep linking for job details
    useEffect(() => {
        const jobId = searchParams.get('view');
        if (jobId) {
            // Find job in columns
            for (const col of columns) {
                const job = col.jobs.find(j => j.id === jobId);
                if (job) {
                    setSelectedJob(job);
                    setIsModalOpen(true);
                    break;
                }
            }
        }
    }, [searchParams, columns]);

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedJob(null);
        // Clean up URL
        const params = new URLSearchParams(searchParams.toString());
        params.delete('view');
        router.replace(`/dashboard?${params.toString()}`, { scroll: false });
    };

    // Show loading skeleton until client-side hydration is complete
    if (!isMounted) {
        return (
            <div className="grid grid-cols-4 gap-3 flex-1 min-h-0 animate-pulse">
                {initialData.map((col) => (
                    <div key={col.id} className="bg-white/[0.02] rounded-xl p-3">
                        <div className="h-6 bg-white/10 rounded mb-3 w-24" />
                        <div className="space-y-2">
                            {col.jobs.slice(0, 3).map((_, i) => (
                                <div key={i} className="h-20 bg-white/5 rounded-lg" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <DndContext
            id={dndContextId}
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
        >
            <div
                className="grid grid-cols-4 gap-3 flex-1 min-h-0"
                role="region"
                aria-label="Job pipeline board"
            >
                {columns.map((col) => (
                    <DroppableColumn
                        key={col.id}
                        column={col}
                        onOpenJob={(job) => {
                            setSelectedJob(job);
                            setIsModalOpen(true);
                            router.push(`/dashboard?view=${job.id}`, { scroll: false });
                        }}
                        onDelete={handleDeleteJob}
                    />
                ))}
            </div>

            {/* DragOverlay renders outside column boundaries for smooth cross-column drag */}
            <DragOverlay dropAnimation={{
                duration: 200,
                easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
            }}>
                {activeJob ? <DragOverlayJobCard job={activeJob} /> : null}
            </DragOverlay>

            <JobDetailModal
                job={selectedJob}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
        </DndContext>
    );
}
