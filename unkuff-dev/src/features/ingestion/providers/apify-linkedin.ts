import { BaseProvider } from "../base-provider";
import { NormalizedJob, IngestionResult } from "../types";
import { ApifyClient } from "apify-client";

export class ApifyLinkedinProvider extends BaseProvider {
    public readonly name = "ApifyLinkedin";

    public async fetch(query: string, options?: any): Promise<IngestionResult> {
        const token = process.env.APIFY_TOKEN;
        if (!token) {
            throw new Error("APIFY_TOKEN is missing in environment");
        }

        const client = new ApifyClient({ token });

        try {
            console.log(`🚀 Starting Apify LinkedIn Scraper for: ${query} in ${options?.location || "New York"}`);

            // Map remote type (1=On-site, 2=Remote, 3=Hybrid)
            const remoteMap: Record<string, string> = {
                "on-site": "1",
                "remote": "2",
                "hybrid": "3"
            };

            const input = {
                title: query,
                location: options?.location || "New York",
                limit: options?.limit || 5,
                datePosted: options?.datePosted || "r604800", // Past week
                remote: options?.workMode ? [remoteMap[options.workMode]] : undefined,
                experienceLevel: options?.experienceLevel ? [this.mapExperienceLevelToLinkedIn(options.experienceLevel)] : undefined
            };

            const run = await client.actor("valig/linkedin-jobs-scraper").call(input);

            console.log(`✅ Apify LinkedIn run complete: ${run.id}. Fetching dataset...`);

            const { items } = await client.dataset(run.defaultDatasetId).listItems();
            const jobs = items.map((item: any) => this.normalize(item));

            return {
                jobs,
                totalFound: items.length,
            };
        } catch (error) {
            console.error("Apify LinkedIn Fetch Error:", error);
            return { jobs: [], totalFound: 0, errors: [String(error)] };
        }
    }

    private mapExperienceLevelToLinkedIn(level: string): string {
        const map: Record<string, string> = {
            "internship": "1",
            "entry": "2",
            "associate": "3",
            "mid-senior": "4",
            "director": "5",
            "executive": "6"
        };
        return map[level] || "";
    }

    protected normalize(raw: any): NormalizedJob {
        // LinkedIn's experience level usually comes as a string "Mid-Senior level"
        const levelMap: Record<string, any> = {
            "Internship": "internship",
            "Entry level": "entry",
            "Associate": "associate",
            "Mid-Senior level": "mid-senior",
            "Director": "director",
            "Executive": "executive"
        };

        // Salary parsing heuristic "$250,000.00/yr - $800,000.00/yr"
        let minSalary: number | undefined;
        let maxSalary: number | undefined;
        let salaryCurrency = "USD";
        let salaryUnit = "year";

        if (raw.salary && typeof raw.salary === "string") {
            const matches = raw.salary.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g);
            if (matches && matches.length >= 1) {
                minSalary = parseInt(matches[0].replace(/[$,]/g, ""));
                if (matches.length >= 2) {
                    maxSalary = parseInt(matches[1].replace(/[$,]/g, ""));
                }
            }
            if (raw.salary.toLowerCase().includes("/yr") || raw.salary.toLowerCase().includes("per year")) {
                salaryUnit = "year";
            } else if (raw.salary.toLowerCase().includes("/hr")) {
                salaryUnit = "hour";
            }
        }

        return {
            title: raw.title,
            company: raw.companyName,
            location: raw.location,

            experienceLevel: levelMap[raw.experienceLevel] || "not-specified",
            employmentType: raw.contractType,

            salarySnippet: raw.salary,
            minSalary,
            maxSalary,
            salaryCurrency,
            salaryUnit,

            description: raw.description,
            descriptionHtml: raw.descriptionHtml,
            snippet: raw.description?.substring(0, 300),

            sourceUrl: raw.url,
            applyUrl: raw.applyUrl,
            sourceName: "ApifyLinkedin",
            sourceId: raw.id,

            applicationsCount: raw.applicationsCount ? parseInt(raw.applicationsCount) : undefined,
            recruiterName: raw.recruiterName,
            recruiterUrl: raw.recruiterUrl,

            companyWebsite: raw.companyUrl,
            companyIndustry: raw.sector,

            postedAt: raw.postedDate ? new Date(raw.postedDate) : undefined,
            hash: this.generateHash(raw.title, raw.companyName),
            sourceActorId: "valig/linkedin-jobs-scraper",
            rawContent: raw,
            metadata: {
                workType: raw.workType,
                applyType: raw.applyType,
                postedTimeAgo: raw.postedTimeAgo
            }
        };
    }
}
