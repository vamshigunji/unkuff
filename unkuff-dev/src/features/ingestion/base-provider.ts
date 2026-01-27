import { NormalizedJob, ProviderConfig, IngestionResult } from "./types";
import { calculateJobHash } from "./utils";

export abstract class BaseProvider {
    public abstract readonly name: string;
    protected config: ProviderConfig;

    constructor(config: ProviderConfig) {
        this.config = config;
    }

    /**
     * Executes the fetch and normalization logic.
     * @param query Search query/keywords
     * @param options Additional search options (location, etc.)
     */
    public abstract fetch(query: string, options?: any): Promise<IngestionResult>;

    /**
     * Maps raw provider data to the unkuff NormalizedJob schema.
     */
    protected abstract normalize(raw: any): NormalizedJob;

    /**
     * Utility to generate the deduplication hash.
     */
    protected generateHash(title: string, company: string, location?: string): string {
        return calculateJobHash(title, company, location);
    }
}
