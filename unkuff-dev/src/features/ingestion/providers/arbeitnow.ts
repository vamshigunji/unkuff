import { BaseAggregator } from "./base-aggregator";
import { NormalizedJob, IngestionResult } from "../types";

export class ArbeitnowProvider extends BaseAggregator {
    public readonly name = "Arbeitnow";
    protected readonly apiUrl = "https://www.arbeitnow.com/api";

    public async fetch(query: string, options?: any): Promise<IngestionResult> {
        try {
            // Arbeitnow uses GET and query params
            // Note: The API might have different filtering capabilities, 
            // but for "Wide Mouth" we fetch the latest and filter locally or use search if available.
            const data = await this.apiFetch("job-board-api", {
                method: "GET"
            });

            // Arbeitnow returns a data array
            // Filter by query if provided (simple local filter for MVP discovery)
            const filtered = (data.data || []).filter((job: any) =>
                job.title.toLowerCase().includes(query.toLowerCase()) ||
                job.company_name.toLowerCase().includes(query.toLowerCase())
            );

            const jobs = filtered.map((job: any) => this.normalize(job));

            return {
                jobs,
                totalFound: data.meta?.total || jobs.length,
            };
        } catch (error) {
            console.error("Arbeitnow Fetch Error:", error);
            return { jobs: [], totalFound: 0, errors: [String(error)] };
        }
    }

    protected normalize(raw: any): NormalizedJob {
        return {
            title: raw.title,
            company: raw.company_name,
            location: raw.location,
            sourceUrl: raw.url,
            sourceName: this.name,
            sourceId: raw.slug,
            snippet: raw.description,
            workMode: raw.remote ? "remote" : "on-site",
            experienceLevel: "not-specified",
            skills: raw.tags || [],
            postedAt: raw.created_at ? new Date(raw.created_at * 1000) : undefined,
            hash: this.generateHash(raw.title, raw.company_name, raw.location),
            metadata: {
                remote: raw.remote,
                tags: raw.tags
            }
        };
    }
}
