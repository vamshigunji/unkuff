import { describe, it, expect, vi, beforeEach } from "vitest";
import { ArbeitnowProvider } from "@/features/ingestion/providers/arbeitnow";
import { IngestionService } from "@/features/ingestion/service";
import { db } from "@/lib/db";

// Mock the API response with a mix of jobs
const MOCK_API_DATA = {
    data: [
        { title: "Senior Data Analyst", company_name: "DataCorp", location: "Remote", url: "https://ex.com/1", slug: "slug-1", description: "...", remote: true, tags: ["Data"] },
        { title: "Backend Engineer", company_name: "TechSoft", location: "Berlin", url: "https://ex.com/2", slug: "slug-2", description: "...", remote: false, tags: ["Node"] },
        { title: "Lead Data Analyst", company_name: "Analytix", location: "London", url: "https://ex.com/3", slug: "slug-3", description: "...", remote: true, tags: ["SQL"] },
        { title: "React Developer", company_name: "WebAgency", location: "Remote", url: "https://ex.com/4", slug: "slug-4", description: "...", remote: true, tags: ["React"] }
    ],
    meta: { total: 4 }
};

vi.mock("@/lib/db", () => {
    const mockDb: any = {
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockImplementation((val) => {
            mockDb._lastValues = val;
            return mockDb;
        }),
        onConflictDoUpdate: vi.fn().mockReturnThis(),
        returning: vi.fn().mockImplementation(() => Promise.resolve(mockDb._lastValues || [])),
        query: {
            jobs: {
                findFirst: vi.fn(),
            },
        },
    };
    return { db: mockDb };
});

describe("Ingestion Accuracy TDD", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Mock global fetch to return our mixed data
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(MOCK_API_DATA),
        });
    });

    it("should ONLY pull and persist jobs matching the 'Data Analyst' query", async () => {
        const provider = new ArbeitnowProvider({ enabled: true });
        const service = new IngestionService([provider]);
        const userId = "test-user-123";

        const result = await service.run(userId, "Data Analyst");

        // Verification phase
        // 1. Check normalized results
        expect(result.jobs.length).toBe(2);
        expect(result.jobs[0].title).toContain("Data Analyst");
        expect(result.jobs[1].title).toContain("Data Analyst");

        // 2. Verify it NEVER tried to persist unrelated jobs
        const insertedData = (db.insert as any).mock.calls[0];
        // The first call to values() should only contain 2 items
        const valuesCalled = (db.insert(null as any).values as any).mock.calls[0][0];

        expect(valuesCalled.length).toBe(2);

        // Assertions for accuracy
        const titlesInserted = valuesCalled.map((j: any) => j.title);
        expect(titlesInserted).toContain("Senior Data Analyst");
        expect(titlesInserted).toContain("Lead Data Analyst");
        expect(titlesInserted).not.toContain("Backend Engineer");
        expect(titlesInserted).not.toContain("React Developer");
    });

    it("should return 0 jobs if no matches exist for the query", async () => {
        const provider = new ArbeitnowProvider({ enabled: true });
        const service = new IngestionService([provider]);

        const result = await service.run("user-1", "Python Developer");

        expect(result.jobs.length).toBe(0);
        expect(db.insert).not.toHaveBeenCalled();
    });
});
