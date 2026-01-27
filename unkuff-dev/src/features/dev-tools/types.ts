/**
 * Dev Tools Types
 * Story 7.1: Manual Apify Ingestion Trigger Button
 */

export type DevIngestionParams = {
    keyword: string;
    location: string;
    maxResults: number;
    source: "linkedin" | "indeed" | "both";
};

export type DevIngestionResult = {
    data?: {
        newJobs: number;
        duplicates: number;
        totalFound: number;
        errors?: string[];
    };
    error?: string;
};

export type IngestionPhase =
    | "idle"
    | "starting"
    | "fetching"
    | "persisting"
    | "complete"
    | "error";

export type IngestionStatus = {
    phase: IngestionPhase;
    message: string;
    result?: {
        newJobs: number;
        duplicates: number;
        errors?: string[];
    };
};
