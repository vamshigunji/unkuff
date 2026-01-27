import { EventEmitter } from "events";

class AppEventEmitter extends EventEmitter { }

// Singleton instance for the application
export const appEvents = new AppEventEmitter();

// Event Constants
export const EVENTS = {
    PROFILE_UPDATED: "profile:updated",
    JOBS_INGESTED: "jobs:ingested",
} as const;

export type EventType = (typeof EVENTS)[keyof typeof EVENTS];
