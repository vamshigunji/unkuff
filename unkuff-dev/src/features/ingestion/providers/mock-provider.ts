import { BaseProvider } from "../base-provider";
import { NormalizedJob, IngestionResult, ProviderConfig } from "../types";

export class MockProvider extends BaseProvider {
    public readonly name = "MockProvider";

    public async fetch(query: string, options?: any): Promise<IngestionResult> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 100));

        const jobs: NormalizedJob[] = [
            this.normalize({ id: "mock-1", title: `${query} Expert`, company: "Acme Corp" }),
            this.normalize({ id: "mock-2", title: `Senior ${query}`, company: "Globex" }),
        ];

        return {
            jobs,
            totalFound: 2
        };
    }

    protected normalize(raw: any): NormalizedJob {
        return {
            title: raw.title,
            company: raw.company,
            sourceUrl: "https://example.com/mock",
            sourceName: this.name,
            sourceId: raw.id,
            hash: this.generateHash(raw.title, raw.company)
        };
    }
}
