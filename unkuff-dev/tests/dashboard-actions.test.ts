import { describe, it, expect, vi, beforeEach } from "vitest";
import { getKanbanBoardData } from "@/features/dashboard/actions";
import { db } from "@/lib/db";
import { jobs } from "@/features/jobs/schema";

vi.mock("@/lib/db", () => ({
    db: {
        query: {
            jobs: {
                findMany: vi.fn(),
            },
            jobMatches: {
                findMany: vi.fn(),
            }
        },
    },
}));

vi.mock("@/auth", () => ({
    auth: vi.fn().mockResolvedValue({ user: { id: "user-123" } }),
}));

describe("Dashboard Actions - getKanbanBoardData", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should fetch jobs and group them into kanban columns", async () => {
        // Mock data from DB with different statuses
        const mockJobs = [
            { id: "1", title: "Job 1", status: "recommended", userId: "user-123" },
            { id: "2", title: "Job 2", status: "applied", userId: "user-123" },
            { id: "3", title: "Job 3", status: "interviewing", userId: "user-123" },
            { id: "4", title: "Job 4", status: "offer", userId: "user-123" },
            { id: "5", title: "Job 5", status: "recommended", userId: "user-123" },
        ];

        (db.query.jobs.findMany as any).mockResolvedValue(mockJobs);
        (db.query.jobMatches.findMany as any).mockResolvedValue([]);

        const result = await getKanbanBoardData();

        expect(result).toHaveLength(4); // 4 columns
        expect(result.find((c) => c.id === "recommended")?.jobs).toHaveLength(2);
        expect(result.find((c) => c.id === "applied")?.jobs).toHaveLength(1);
        expect(result.find((c) => c.id === "interviewing")?.jobs).toHaveLength(1);
        expect(result.find((c) => c.id === "offer")?.jobs).toHaveLength(1);
    });

    it("should return empty columns if no jobs found", async () => {
        (db.query.jobs.findMany as any).mockResolvedValue([]);
        (db.query.jobMatches.findMany as any).mockResolvedValue([]);

        const result = await getKanbanBoardData();

        expect(result).toHaveLength(4);
        expect(result.every((c) => c.jobs.length === 0)).toBe(true);
    });
});
