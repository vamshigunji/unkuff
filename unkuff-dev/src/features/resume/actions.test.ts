import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the auth and db modules
vi.mock("@/auth", () => ({
    auth: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
    db: {
        query: {
            profiles: {
                findFirst: vi.fn(),
            },
            workExperience: {
                findMany: vi.fn(),
            },
            education: {
                findMany: vi.fn(),
            },
            skills: {
                findMany: vi.fn(),
            },
            certifications: {
                findMany: vi.fn(),
            },
        },
    },
}));

vi.mock("@/lib/encryption", () => ({
    decrypt: vi.fn((val: string) => val),
}));

import { getResumeData, hasProfileData } from "./actions";
import { auth } from "@/auth";
import { db } from "@/lib/db";

// Type helpers for mocking
type MockAuth = ReturnType<typeof vi.fn>;
type MockDbQuery = {
    query: {
        profiles: { findFirst: ReturnType<typeof vi.fn> };
        workExperience: { findMany: ReturnType<typeof vi.fn> };
        education: { findMany: ReturnType<typeof vi.fn> };
        skills: { findMany: ReturnType<typeof vi.fn> };
        certifications: { findMany: ReturnType<typeof vi.fn> };
    };
};

const mockAuth = auth as unknown as MockAuth;
const mockDb = db as unknown as MockDbQuery;

describe("Resume Actions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("getResumeData", () => {
        it("should return error when user is not authenticated", async () => {
            mockAuth.mockResolvedValueOnce(null);

            const result = await getResumeData();

            expect(result.data).toBeNull();
            expect(result.error).toBe("Unauthorized");
        });

        it("should return error when profile is not found", async () => {
            mockAuth.mockResolvedValueOnce({
                user: { id: "user-123", email: "test@example.com" },
                expires: new Date().toISOString(),
            });
            mockDb.query.profiles.findFirst.mockResolvedValueOnce(undefined);

            const result = await getResumeData();

            expect(result.data).toBeNull();
            expect(result.error).toBe("Profile not found");
        });

        it("should return resume data when profile exists", async () => {
            mockAuth.mockResolvedValueOnce({
                user: { id: "user-123", email: "test@example.com" },
                expires: new Date().toISOString(),
            });

            mockDb.query.profiles.findFirst.mockResolvedValueOnce({
                id: "profile-123",
                userId: "user-123",
                name: "John Doe",
                bio: "A software engineer",
                summary: "Experienced developer",
                location: "San Francisco",
                phone: "+1234567890",
                address: null,
                idNumber: null,
                hobbies: null,
                interests: null,
                bioEmbedding: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            mockDb.query.workExperience.findMany.mockResolvedValueOnce([]);
            mockDb.query.education.findMany.mockResolvedValueOnce([]);
            mockDb.query.skills.findMany.mockResolvedValueOnce([
                {
                    id: "s1",
                    name: "TypeScript",
                    profileId: "profile-123",
                    level: "Expert",
                    category: "Frontend",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ]);
            mockDb.query.certifications.findMany.mockResolvedValueOnce([]);

            const result = await getResumeData();

            expect(result.error).toBeNull();
            expect(result.data).toBeDefined();
            expect(result.data?.contact.fullName).toBe("John Doe");
            expect(result.data?.contact.email).toBe("test@example.com");
            expect(result.data?.skills).toContain("TypeScript");
        });
    });

    describe("hasProfileData", () => {
        it("should return false when user is not authenticated", async () => {
            mockAuth.mockResolvedValueOnce(null);

            const result = await hasProfileData();

            expect(result.data).toBe(false);
            expect(result.error).toBe("Unauthorized");
        });

        it("should return false when profile does not exist", async () => {
            mockAuth.mockResolvedValueOnce({
                user: { id: "user-123" },
                expires: new Date().toISOString(),
            });
            mockDb.query.profiles.findFirst.mockResolvedValueOnce(undefined);

            const result = await hasProfileData();

            expect(result.data).toBe(false);
            expect(result.error).toBeNull();
        });

        it("should return true when profile has name", async () => {
            mockAuth.mockResolvedValueOnce({
                user: { id: "user-123" },
                expires: new Date().toISOString(),
            });
            mockDb.query.profiles.findFirst.mockResolvedValueOnce({
                id: "profile-123",
                name: "John Doe",
                summary: null,
                bio: null,
            });

            const result = await hasProfileData();

            expect(result.data).toBe(true);
            expect(result.error).toBeNull();
        });
    });
});
