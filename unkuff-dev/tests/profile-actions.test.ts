import { describe, it, expect, vi, beforeEach } from "vitest";
import { saveProfile, getProfile } from "@/features/profile/actions";
import { db } from "@/lib/db";
import { encrypt, decrypt } from "@/lib/encryption";

vi.mock("@/lib/db", () => ({
    db: {
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        query: {
            profiles: {
                findFirst: vi.fn(),
            },
        },
    },
}));

vi.mock("../src/lib/encryption", () => ({
    encrypt: vi.fn((text) => `enc:${text}`),
    decrypt: vi.fn((text) => text.replace("enc:", "")),
}));

describe("Profile Actions - PII Encryption", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should encrypt PII fields before saving", async () => {
        const profileData = {
            userId: "user-1",
            phone: "123-456-7890",
            address: "123 Main St",
        };

        await saveProfile(profileData);

        expect(encrypt).toHaveBeenCalledWith("123-456-7890");
        expect(encrypt).toHaveBeenCalledWith("123 Main St");
        expect(db.insert).toHaveBeenCalled();
    });

    it("should decrypt PII fields after fetching", async () => {
        const mockProfile = {
            userId: "user-1",
            phone: "enc:123-456-7890",
            address: "enc:123 Main St",
        };

        (db.query.profiles.findFirst as any).mockResolvedValue(mockProfile);

        const result = await getProfile();

        expect(decrypt).toHaveBeenCalledWith("enc:123-456-7890");
        expect(decrypt).toHaveBeenCalledWith("enc:123 Main St");
        expect(result?.phone).toBe("123-456-7890");
    });
});
