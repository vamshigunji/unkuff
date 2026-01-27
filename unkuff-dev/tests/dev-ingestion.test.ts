import { describe, it, expect, vi, beforeEach } from "vitest";
import { triggerDevIngestion } from "@/features/dev-tools/actions";

// Mock dependencies
vi.mock("@/auth", () => ({
    auth: vi.fn(),
}));

vi.mock("@/features/ingestion/service", () => ({
    IngestionService: vi.fn().mockImplementation(function() {
        return {
            run: vi.fn().mockResolvedValue({ jobs: [], totalFound: 0 }),
        };
    }),
}));

describe("triggerDevIngestion", () => {
    const originalEnv = process.env.NODE_ENV;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should succeed in production mode (TDD target state)", async () => {
        // Force production environment
        vi.stubEnv("NODE_ENV", "production");
        
        // Mock auth to return a valid user
        const { auth } = await import("@/auth");
        vi.mocked(auth).mockResolvedValue({ user: { id: "user-123" } } as any);

        const params = {
            keyword: "Data Scientist",
            location: "San Francisco",
            maxResults: 5,
            source: "linkedin" as const,
        };

        const result = await triggerDevIngestion(params);
        
        // This should fail until we remove the production guard
        expect(result.error).toBeUndefined();
        expect(result.data).toBeDefined();
    });
});
