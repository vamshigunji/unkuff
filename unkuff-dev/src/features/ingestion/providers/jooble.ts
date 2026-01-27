import { BaseAggregator } from "./base-aggregator";
import { NormalizedJob, IngestionResult } from "../types";

export class JoobleProvider extends BaseAggregator {
    public readonly name = "Jooble";
    protected readonly apiUrl = "https://jooble.org/api";

    public async fetch(query: string, options?: any): Promise<IngestionResult> {
        const apiKey = this.config.apiKey || process.env.JOOBLE_API_KEY;
        if (!apiKey) {
            throw new Error("Jooble API Key is missing");
        }

        try {
            const data = await this.apiFetch(apiKey, {
                method: "POST",
                body: JSON.stringify({
                    keywords: query,
                    location: options?.location || "",
                }),
            });

            const jobs = (data.jobs || []).map((job: any) => this.normalize(job));

            return {
                jobs,
                totalFound: data.totalCount || jobs.length,
            };
        } catch (error) {
            console.error("Jooble Fetch Error:", error);
            return { jobs: [], totalFound: 0, errors: [String(error)] };
        }
    }

    protected normalize(raw: any): NormalizedJob {
        return {
            title: raw.title,
            company: raw.company,
            location: raw.location,
            salarySnippet: raw.salary,
            sourceUrl: raw.link,
            sourceName: this.name,
            sourceId: String(raw.id),
            snippet: raw.snippet,
            postedAt: raw.updated ? new Date(raw.updated) : undefined,
            hash: this.generateHash(raw.title, raw.company, raw.location),
            metadata: {
                type: raw.type,
                source: raw.source
            }
        };
    }
}
