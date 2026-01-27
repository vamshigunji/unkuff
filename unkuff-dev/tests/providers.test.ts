import { describe, it, expect, vi, beforeEach } from "vitest";
import { JoobleProvider } from "@/features/ingestion/providers/jooble";
import { ArbeitnowProvider } from "@/features/ingestion/providers/arbeitnow";

// Mock global fetch
global.fetch = vi.fn();

describe("Aggregator Providers", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("JoobleProvider should format POST request correctly", async () => {
        (fetch as any).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ jobs: [], totalCount: 0 }),
        });

        const provider = new JoobleProvider({ enabled: true, apiKey: "test-key" });
        await provider.fetch("React", { location: "USA" });

        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining("jooble.org/api/test-key"),
            expect.objectContaining({
                method: "POST",
                body: expect.stringContaining('"keywords":"React"'),
            })
        );
    });

    it("ArbeitnowProvider should format GET request correctly", async () => {
        (fetch as any).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ data: [], meta: { total: 0 } }),
        });

        const provider = new ArbeitnowProvider({ enabled: true });
        await provider.fetch("React");

        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining("arbeitnow.com/api/job-board-api"),
            expect.objectContaining({
                method: "GET",
            })
        );
    });
});
