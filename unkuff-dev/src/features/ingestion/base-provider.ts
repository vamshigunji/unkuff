import { NormalizedJob, ProviderConfig, IngestionResult } from "./types";

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
    protected generateHash(title: string, company: string): string {
        const clean = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, "");
        return `${clean(title)}|${clean(company)}`;
    }
}
