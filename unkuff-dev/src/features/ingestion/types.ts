export interface NormalizedJob {
    id?: string;
    title: string;
    company: string;
    location?: string; // Raw location string

    // Structured Location
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    latitude?: string;
    longitude?: string;

    workMode?: "remote" | "hybrid" | "on-site" | "unknown";
    experienceLevel?: "internship" | "entry" | "associate" | "mid-senior" | "director" | "executive" | "not-specified";
    employmentType?: string;

    salarySnippet?: string;
    minSalary?: number;
    maxSalary?: number;
    salaryCurrency?: string;
    salaryUnit?: string;

    description?: string;
    descriptionHtml?: string;
    snippet?: string;

    skills?: string[];
    benefits?: string[];
    qualifications?: string[];
    responsibilities?: string[];

    sourceUrl: string;
    applyUrl?: string;
    sourceName: string;
    sourceId: string;
    sourceActorId?: string;

    applicationsCount?: number;
    recruiterName?: string;
    recruiterUrl?: string;

    companyWebsite?: string;
    companyIndustry?: string;
    companyLogo?: string;
    companyRevenue?: string;
    companyEmployeesCount?: string;
    companyRating?: string;
    companyRatingsCount?: number;
    companyCeoName?: string;
    companyDescription?: string;

    technographics?: string[];
    postedAt?: Date;
    status?: string;
    metadata?: Record<string, any>;
    rawContent?: any;
    hash: string;
}

export type IngestionResult = {
    jobs: NormalizedJob[];
    totalFound: number;
    errors?: string[];
};

export interface ProviderConfig {
    apiKey?: string;
    baseUrl?: string;
    enabled: boolean;
    [key: string]: any;
}
