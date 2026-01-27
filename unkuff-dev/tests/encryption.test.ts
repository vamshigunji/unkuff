import { describe, it, expect, beforeAll } from "vitest";
import { encrypt, decrypt } from "@/lib/encryption";

describe("Encryption Utility", () => {
    beforeAll(() => {
        process.env.ENCRYPTION_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
    });

    it("should encrypt and decrypt a string correctly", () => {
        const text = "Hello, world!";
        const encrypted = encrypt(text);
        expect(encrypted).not.toBe(text);
        const decrypted = decrypt(encrypted);
        expect(decrypted).toBe(text);
    });

    it("should fail if the encryption key is missing", () => {
        // We'll test this behavior after implementation
    });
});
