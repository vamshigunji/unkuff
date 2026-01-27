import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { jobs } from "@/features/jobs/schema";
import { auth } from "@/auth";
import { and, eq } from "drizzle-orm";

// Define mock functions globally
const mockDelete = vi.fn();
const mockWhere = vi.fn();
const mockReturning = vi.fn();

// Mock the db module completely
vi.mock("@/lib/db", () => ({
    db: {
        delete: mockDelete,
        where: mockWhere,
        returning: mockReturning,
    },
}));

vi.mock("@/auth", () => ({
    auth: vi.fn(),
}));

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}));

// Import the action AFTER mocking dependencies
import { deleteJob } from "@/features/dashboard/actions";
import { db } from "@/lib/db"; // Import the actual db object for typing purposes

describe("Dashboard Actions - deleteJob", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset specific mock implementations
        mockDelete.mockClear();
        mockWhere.mockClear();
        mockReturning.mockClear();

        // Set up chaining for each test
        mockDelete.mockReturnValue({ where: mockWhere });
        mockWhere.mockReturnValue({ returning: mockReturning });
    });

    it("should successfully delete a job if authorized", async () => {
        vi.mocked(auth).mockResolvedValue({ user: { id: "user-123" } });
        mockReturning.mockResolvedValue([{ id: "job-123" }]);

        const result = await deleteJob("job-123");

        expect(mockDelete).toHaveBeenCalledWith(jobs);
        expect(mockWhere).toHaveBeenCalledWith(
            and(eq(jobs.id, "job-123"), eq(jobs.userId, "user-123"))
        );
        expect(mockReturning).toHaveBeenCalledOnce();
        expect(result).toEqual({ data: true, error: null });
    });

    it("should return an error if unauthorized", async () => {
        vi.mocked(auth).mockResolvedValue(null);

        const result = await deleteJob("job-123");

        expect(mockDelete).not.toHaveBeenCalled();
        expect(result).toEqual({ data: null, error: "Unauthorized" });
    });

    it("should return an error if job not found or access denied", async () => {
        vi.mocked(auth).mockResolvedValue({ user: { id: "user-123" } });
        mockReturning.mockResolvedValue([]);

        const result = await deleteJob("job-456");

        expect(mockDelete).toHaveBeenCalledWith(jobs);
        expect(mockWhere).toHaveBeenCalledWith(
            and(eq(jobs.id, "job-456"), eq(jobs.userId, "user-123"))
        );
        expect(mockReturning).toHaveBeenCalledOnce();
        expect(result).toEqual({ data: null, error: "Job not found or access denied" });
    });

    it("should return an error for invalid job ID format", async () => {
        vi.mocked(auth).mockResolvedValue({ user: { id: "user-123" } });

        const result = await deleteJob("invalid-job-id");

        expect(mockDelete).not.toHaveBeenCalled();
        expect(result).toEqual({ data: null, error: "Invalid job ID" });
    });
});




