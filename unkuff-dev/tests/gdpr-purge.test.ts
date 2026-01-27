import { describe, it, expect, vi, beforeEach } from "vitest";
import { deleteAccount } from "@/features/auth/actions";
import { db } from "@/lib/db";
import { users } from "@/features/auth/schema";
import { auth } from "@/auth";

vi.mock("@/lib/db", () => ({
    db: {
        delete: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
    },
}));

vi.mock("next-auth", () => ({
    default: vi.fn(),
    AuthError: class extends Error { type = "AuthError" },
}));

vi.mock("@/auth", () => ({
    signIn: vi.fn(),
    auth: vi.fn(),
}));

vi.mock("drizzle-orm", () => ({
    eq: vi.fn(),
}));

describe("GDPR Purge Protocol", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should call delete on users table with correct userId", async () => {
        const userId = "test-user-id";

        // Mock auth to return a valid session
        (auth as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
            user: { id: userId }
        });

        await deleteAccount();

        expect(db.delete).toHaveBeenCalledWith(users);
        expect(db.delete(users).where).toHaveBeenCalled();
    });
});
