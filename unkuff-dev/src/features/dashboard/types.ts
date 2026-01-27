import { Job } from '../../db/schema';
export type { Job };

// These match the database enum values - DO NOT CHANGE without migration
export type KanbanStatus = 'recommended' | 'applied' | 'interviewing' | 'offer' | 'rejected' | 'archived';

export type SerializedJob = Omit<Job, 'createdAt' | 'updatedAt' | 'postedAt' | 'notes'> & {
    createdAt: string | null;
    updatedAt: string | null;
    postedAt: string | null;
    notes?: string | null;
};

export interface KanbanColumn<T = Job> {
    id: KanbanStatus;
    label: string;
    jobs: T[];
}

// Display labels are user-friendly, but IDs match database schema
export const KANBAN_COLUMNS: { id: KanbanStatus; label: string }[] = [
    { id: 'recommended', label: 'For You' },      // "Recommended" in DB shown as "For You"
    { id: 'applied', label: 'Applied' },
    { id: 'interviewing', label: 'Interviewing' },
    { id: 'offer', label: 'Offers' },
];
