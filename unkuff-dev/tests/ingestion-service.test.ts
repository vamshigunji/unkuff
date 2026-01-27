import { describe, it, expect, vi, beforeEach } from "vitest";
import { IngestionService } from "@/features/ingestion/service";
import { MockProvider } from "@/features/ingestion/providers/mock-provider";
import { db } from "@/lib/db";

vi.mock("@/lib/db", () => ({
    db: {
        insert: vi.fn(() => ({
            values: vi.fn(() => ({
                onConflictDoUpdate: vi.fn(() => ({
                    returning: vi.fn().mockResolvedValue([
                        { id: "job-1", title: "Job 1" },
                        { id: "job-2", title: "Job 2" }
                    ]),
                })),
            })),
        })),
        query: {
            jobs: {
                findFirst: vi.fn(),
            },
        },
        update: vi.fn(() => ({
            set: vi.fn(() => ({
                where: vi.fn(),
            })),
        })),
    },
}));

describe("Ingestion Service", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should run providers and persist results", async () => {
        const provider = new MockProvider({ enabled: true });
        const service = new IngestionService([provider]);

        const result = await service.run("user-1", "React");

        expect(result.jobs.length).toBe(2);
        expect(db.insert).toHaveBeenCalled();
        expect(result.totalFound).toBe(2);
    });

    it("should deduplicate jobs within batch", async () => {
        const provider = new MockProvider({ enabled: true });
        const service = new IngestionService([provider]);

        // New service uses batch insert with ON CONFLICT, so it always calls insert once per run with all jobs
        const result = await service.run("user-1", "React");

        expect(db.insert).toHaveBeenCalledTimes(1);
        expect(result.jobs.length).toBe(2);
    });

    it("should handle provider failures gracefully", async () => {
        const failingProvider = {
            name: "Failing",
            fetch: vi.fn().mockRejectedValue(new Error("Network Error")),
        } as any;

        const service = new IngestionService([failingProvider]);
        const result = await service.run("user-1", "React");

        expect(result.errors).toBeDefined();
        expect(result.errors?.[0]).toContain("Network Error");
        expect(result.jobs.length).toBe(0);
    });
});
