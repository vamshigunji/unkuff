import { BaseAggregator } from "./base-aggregator";
import { NormalizedJob, IngestionResult } from "../types";

export class TheirStackProvider extends BaseAggregator {
    public readonly name = "TheirStack";
    protected readonly apiUrl = "https://api.theirstack.com/v1";

    /**
     * TheirStack can search or fetch details.
     * For hydration, we typically use search with a specific ID or URL filter.
     */
    public async fetch(query: string, options?: any): Promise<IngestionResult> {
        const apiKey = this.config.apiKey || process.env.THEIRSTACK_API_KEY;
        if (!apiKey) {
            throw new Error("TheirStack API Key is missing");
        }

        try {
            const response = await this.apiFetch("jobs/search", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    blur_company_name: false,
                    include_url: true,
                    page: 0,
                    limit: 10,
                    // If we have a specific sourceId, we try to matches it
                    ...(options?.sourceId ? { ids: [options.sourceId] } : { search_term: query })
                }),
            });

            const jobs = (response.data || []).map((job: any) => this.normalize(job));

            return {
                jobs,
                totalFound: response.total_count || jobs.length,
            };
        } catch (error) {
            console.error("TheirStack Fetch Error:", error);
            return { jobs: [], totalFound: 0, errors: [String(error)] };
        }
    }

    /**
     * Specific method for on-demand hydration of a single job.
     */
    public async hydrate(sourceId: string): Promise<Partial<NormalizedJob> | null> {
        const apiKey = this.config.apiKey || process.env.THEIRSTACK_API_KEY;
        if (!apiKey) throw new Error("TheirStack API Key is missing");

        try {
            // TheirStack search allows filtering by ID
            const response = await this.apiFetch("jobs/search", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    ids: [sourceId],
                    limit: 1
                }),
            });

            const rawJob = response.data?.[0];
            if (!rawJob) return null;

            const normalized = this.normalize(rawJob);
            return {
                description: normalized.description,
                technographics: normalized.technographics,
                companyWebsite: normalized.companyWebsite,
                salarySnippet: normalized.salarySnippet,
                minSalary: normalized.minSalary,
                maxSalary: normalized.maxSalary,
                metadata: normalized.metadata
            };
        } catch (error) {
            console.error("TheirStack Hydration Error:", error);
            return null;
        }
    }

    protected normalize(raw: any): NormalizedJob {
        return {
            title: raw.job_title,
            company: raw.company_name,
            location: raw.location,
            salarySnippet: raw.salary_string,
            minSalary: raw.salary_min,
            maxSalary: raw.salary_max,
            description: raw.job_description,
            sourceUrl: raw.url,
            sourceName: this.name,
            sourceId: raw.id,
            technographics: raw.technologies?.map((t: any) => t.name) || [],
            companyWebsite: raw.company_url,
            postedAt: raw.date ? new Date(raw.date) : undefined,
            hash: this.generateHash(raw.job_title, raw.company_name, raw.location),
            metadata: {
                seniority: raw.seniority,
                employment_type: raw.employment_type,
                industry: raw.company_industry
            }
        };
    }
}
