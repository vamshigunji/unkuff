'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SerializedJob } from '../types';
import { JobCard } from './job-card';

interface DraggableJobCardProps {
    job: SerializedJob;
    onOpenJob: (job: SerializedJob) => void;
    onDelete: (jobId: string) => void;
}

/**
 * Draggable wrapper for JobCard using dnd-kit's useSortable
 */
export function DraggableJobCard({ job, onOpenJob, onDelete }: DraggableJobCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: job.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        // When dragging, the original card position shows a ghost
        opacity: isDragging ? 0.5 : 1,
        // Performance optimization for smooth drag
        willChange: isDragging ? 'transform' : 'auto',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            data-testid="draggable-job-card"
            data-id={job.id}
            className={`touch-none ${isDragging ? 'opacity-50 z-50' : ''}`}
            {...attributes}
            {...listeners}
        >
            <JobCard
                job={job}
                onClick={() => onOpenJob(job)}
                onDelete={() => onDelete(job.id)}
            />
        </div>
    );
}

/**
 * Overlay version of JobCard shown during cross-column drag
 * 
 * This renders in a portal above all columns to prevent
 * clipping issues during drag operations
 */
export function DragOverlayJobCard({ job }: { job: SerializedJob }) {
    return (
        <div
            className="cursor-grabbing opacity-95"
            style={{
                transform: 'scale(1.02)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)',
            }}
        >
            <JobCard job={job} />
        </div>
    );
}
