import { describe, it, expect, vi, beforeEach } from "vitest";
import { TheirStackProvider } from "@/features/ingestion/providers/theirstack";
import { IngestionService } from "@/features/ingestion/service";
import { db } from "@/lib/db";

// Mock global fetch
global.fetch = vi.fn();

vi.mock("@/lib/db", () => ({
    db: {
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        query: {
            jobs: {
                findFirst: vi.fn(),
            },
        },
    },
}));

describe("TheirStack In-App Hydration", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should fetch job details and map technographics correctly", async () => {
        (fetch as any).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({
                data: [{
                    id: "ts-123",
                    job_title: "Cloud Architect",
                    company_name: "Tech Solutions",
                    job_description: "Full description...",
                    technologies: [{ name: "AWS" }, { name: "Terraform" }],
                    company_url: "https://techsolutions.com"
                }]
            }),
        });

        const provider = new TheirStackProvider({ enabled: true, apiKey: "ts-key" });
        const result = await provider.hydrate("ts-123");

        expect(result?.description).toBe("Full description...");
        expect(result?.technographics).toContain("AWS");
        expect(result?.technographics).toContain("Terraform");
        expect(result?.companyWebsite).toBe("https://techsolutions.com");
    });

    it("should trigger hydration through IngestionService and save to DB", async () => {
        const provider = new TheirStackProvider({ enabled: true, apiKey: "ts-key" });
        const service = new IngestionService([provider]);

        // Mock existing unhydrated job
        (db.query.jobs.findFirst as any).mockResolvedValue({
            id: "job-1",
            userId: "user-1",
            sourceId: "ts-123",
            description: "",
            technographics: []
        });

        // Mock TheirStack response
        (fetch as any).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({
                data: [{
                    id: "ts-123",
                    job_title: "Cloud Architect",
                    company_name: "Tech Solutions",
                    job_description: "Deep description",
                    technologies: [{ name: "AWS" }]
                }]
            }),
        });

        const success = await service.hydrateJob("user-1", "job-1", provider);

        expect(success).toBe(true);
        expect(db.update).toHaveBeenCalled();
    });
});
