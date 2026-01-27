'use client';

import { useState, useCallback, useMemo } from 'react';
import {
    DragStartEvent,
    DragEndEvent,
    PointerSensor,
    KeyboardSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { KanbanColumn, KanbanStatus, SerializedJob } from '../types';

export type MoveJobHandler = (
    jobId: string,
    toStatus: KanbanStatus
) => Promise<{ data: boolean | null; error: string | null }>;

interface UseKanbanDndResult {
    columns: KanbanColumn<SerializedJob>[];
    activeId: string | null;
    activeJob: SerializedJob | null;
    isDragging: boolean;
    sensors: ReturnType<typeof useSensors>;
    handleDragStart: (event: DragStartEvent) => void;
    handleDragEnd: (event: DragEndEvent) => Promise<void>;
    handleDragCancel: () => void;
    removeJob: (jobId: string) => void;
    addJob: (job: SerializedJob, columnId: KanbanStatus) => void;
}

/**
 * Hook for managing Kanban drag-and-drop state with dnd-kit
 * 
 * @param initialColumns - Initial column data from server
 * @param onMoveJob - Server Action to persist status change
 */
export function useKanbanDnd(
    initialColumns: KanbanColumn<SerializedJob>[],
    onMoveJob?: MoveJobHandler
): UseKanbanDndResult {
    const [columns, setColumns] = useState(initialColumns);
    const [activeId, setActiveId] = useState<string | null>(null);

    // Update columns when props change (e.g., after server revalidation)
    useMemo(() => {
        setColumns(initialColumns);
    }, [initialColumns]);

    // Configure sensors with activation constraints
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Prevents accidental drags on click
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Derived state
    const isDragging = activeId !== null;

    // Find the active job from all columns
    const activeJob = useMemo(() => {
        if (!activeId) return null;
        for (const column of columns) {
            const job = column.jobs.find((j) => j.id === activeId);
            if (job) return job;
        }
        return null;
    }, [activeId, columns]);

    const addJob = useCallback((job: SerializedJob, columnId: KanbanStatus) => {
        setColumns((prevColumns) => {
            return prevColumns.map(column => {
                if (column.id === columnId) {
                    return { ...column, jobs: [job, ...column.jobs] };
                }
                return column;
            });
        });
    }, []);

    // Find which column a job belongs to
    const findJobColumn = useCallback(
        (jobId: string): KanbanStatus | null => {
            for (const column of columns) {
                if (column.jobs.some((j) => j.id === jobId)) {
                    return column.id;
                }
            }
            return null;
        },
        [columns]
    );

    const removeJob = useCallback((jobId: string) => {
        setColumns((prevColumns) => {
            return prevColumns.map(column => ({
                ...column,
                jobs: column.jobs.filter(job => job.id !== jobId),
            }));
        });
    }, []);

    // Move job between columns optimistically
    const moveJobOptimistically = useCallback(
        (jobId: string, fromColumn: KanbanStatus, toColumn: KanbanStatus) => {
            setColumns((prevColumns) => {
                const newColumns = prevColumns.map((col) => {
                    if (col.id === fromColumn) {
                        // Remove job from source column
                        return {
                            ...col,
                            jobs: col.jobs.filter((j) => j.id !== jobId),
                        };
                    }
                    if (col.id === toColumn) {
                        // Add job to target column (find it first)
                        const job = prevColumns
                            .find((c) => c.id === fromColumn)
                            ?.jobs.find((j) => j.id === jobId);
                        if (job) {
                            return {
                                ...col,
                                jobs: [{ ...job, status: toColumn }, ...col.jobs],
                            };
                        }
                    }
                    return col;
                });
                return newColumns;
            });
        },
        []
    );

    // Handle drag start
    const handleDragStart = useCallback((event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    }, []);

    // Handle drag end
    const handleDragEnd = useCallback(
        async (event: DragEndEvent) => {
            const { active, over } = event;

            // Clear active state immediately
            setActiveId(null);

            // No drop target
            if (!over) return;

            const jobId = active.id as string;
            const overId = over.id as string;

            // Find source column
            const sourceColumn = findJobColumn(jobId);
            if (!sourceColumn) return;

            // Determine target column
            // The over.id could be a column ID or another job ID
            let targetColumn: KanbanStatus | null = null;

            // Check if overId is a column ID
            const isColumnId = columns.some((col) => col.id === overId);
            if (isColumnId) {
                targetColumn = overId as KanbanStatus;
            } else {
                // overId is a job ID, find its column
                targetColumn = findJobColumn(overId);
            }

            if (!targetColumn) return;

            // Don't do anything if dropped in the same column
            if (sourceColumn === targetColumn) return;

            // Optimistically update the UI immediately
            moveJobOptimistically(jobId, sourceColumn, targetColumn);

            // Call the move handler if provided
            if (onMoveJob) {
                const result = await onMoveJob(jobId, targetColumn);

                // Rollback if the server action failed
                if (result.error) {
                    // Revert the optimistic update
                    moveJobOptimistically(jobId, targetColumn, sourceColumn);
                    console.error('Failed to update job status:', result.error);
                }
            }
        },
        [columns, findJobColumn, onMoveJob, moveJobOptimistically]
    );

    // Handle drag cancel
    const handleDragCancel = useCallback(() => {
        setActiveId(null);
    }, []);

    return {
        columns,
        activeId,
        activeJob,
        isDragging,
        sensors,
        handleDragStart,
        handleDragEnd,
        handleDragCancel,
        removeJob,
        addJob,
    };
}
