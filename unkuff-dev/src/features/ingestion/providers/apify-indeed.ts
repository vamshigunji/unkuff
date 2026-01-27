import { BaseProvider } from "../base-provider";
import { NormalizedJob, IngestionResult } from "../types";
import { ApifyClient } from "apify-client";

export class ApifyIndeedProvider extends BaseProvider {
    public readonly name = "ApifyIndeed";

    public async fetch(query: string, options?: any): Promise<IngestionResult> {
        const token = process.env.APIFY_TOKEN;
        if (!token) {
            throw new Error("APIFY_TOKEN is missing in environment");
        }

        const client = new ApifyClient({ token });

        try {
            console.log(`🚀 Starting Apify Indeed Scraper for: ${query} in ${options?.location || "San Francisco"}`);

            // Trigger the actor and wait for it to finish
            const run = await client.actor("valig/indeed-jobs-scraper").call({
                country: "us",
                title: query,
                location: options?.location || "San Francisco",
                limit: options?.limit || 5,
                datePosted: options?.datePosted || ""
            });

            console.log(`✅ Apify run complete: ${run.id}. Fetching dataset...`);

            // Fetch results from the dataset
            const { items } = await client.dataset(run.defaultDatasetId).listItems();

            const jobs = items.map((item: any) => this.normalize(item));

            return {
                jobs,
                totalFound: items.length,
            };
        } catch (error) {
            console.error("Apify Indeed Fetch Error:", error);
            return { jobs: [], totalFound: 0, errors: [String(error)] };
        }
    }

    protected normalize(raw: any): NormalizedJob {
        // Map Indeed attributes to our skills and benefits arrays
        const skills: string[] = [];
        const benefits: string[] = [];
        if (raw.attributes) {
            Object.values(raw.attributes).forEach((attr: any) => {
                // Heuristic: If it looks like a skill or tool, add to skills
                if (typeof attr === "string") skills.push(attr);
            });
        }
        if (raw.benefits) {
            Object.values(raw.benefits).forEach((ben: any) => {
                if (typeof ben === "string") benefits.push(ben);
            });
        }

        return {
            title: raw.title,
            company: raw.employer?.name || "Unknown",
            location: raw.location ? `${raw.location.city}, ${raw.location.admin1Code || ""}` : "Remote",

            // Structured Location
            city: raw.location?.city,
            state: raw.location?.admin1Code,
            country: raw.location?.countryName,
            postalCode: raw.location?.postalCode,
            latitude: String(raw.location?.latitude || ""),
            longitude: String(raw.location?.longitude || ""),

            // Compensation
            salarySnippet: raw.baseSalary ? `${raw.baseSalary.min} - ${raw.baseSalary.max} ${raw.baseSalary.currencyCode}` : undefined,
            minSalary: raw.baseSalary?.min,
            maxSalary: raw.baseSalary?.max,
            salaryCurrency: raw.baseSalary?.currencyCode,
            salaryUnit: raw.baseSalary?.unitOfWork,

            // Description
            description: raw.description?.text,
            descriptionHtml: raw.description?.html,
            snippet: raw.description?.text?.substring(0, 300),

            skills,
            benefits,

            sourceUrl: raw.url,
            applyUrl: raw.jobUrl,
            sourceName: this.name,
            sourceId: raw.key || raw.refNum,

            // Company Intelligence
            companyWebsite: raw.employer?.corporateWebsite,
            companyIndustry: raw.employer?.industry,
            companyLogo: raw.employer?.logoUrl,
            companyRevenue: raw.employer?.revenue,
            companyEmployeesCount: raw.employer?.employeesCount,
            companyRating: String(raw.employer?.ratingsValue || ""),
            companyRatingsCount: raw.employer?.ratingsCount,
            companyCeoName: raw.employer?.ceoName,
            companyDescription: raw.employer?.briefDescription,

            postedAt: raw.datePublished ? new Date(raw.datePublished) : undefined,
            hash: this.generateHash(raw.title, raw.employer?.name || "Unknown"),
            sourceActorId: "valig/indeed-jobs-scraper",
            rawContent: raw,
            metadata: {
                jobUrl: raw.jobUrl,
                originalAttributes: raw.attributes,
                originalBenefits: raw.benefits,
                jobTypes: raw.jobTypes
            }
        };
    }
}
