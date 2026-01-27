import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;

/**
 * Encrypts a string using AES-256-GCM.
 * The output is a colon-separated string: iv:authTag:encryptedContent
 */
export function encrypt(text: string): string {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

/**
 * Decrypts a string encrypted with AES-256-GCM.
 * Returns null if data is not in expected format (handles legacy unencrypted data).
 */
export function decrypt(encryptedData: string): string | null {
    const key = getEncryptionKey();
    const parts = encryptedData.split(":");

    // Check if data is in expected encrypted format (iv:authTag:content)
    if (parts.length !== 3) {
        console.warn("[Encryption] Data not in encrypted format, returning null. Consider re-encrypting.");
        return null;
    }

    const [ivHex, authTagHex, encryptedContentHex] = parts;

    if (!ivHex || !authTagHex || !encryptedContentHex) {
        console.warn("[Encryption] Invalid encrypted data parts, returning null.");
        return null;
    }

    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const encryptedContent = Buffer.from(encryptedContentHex, "hex");

    try {
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);

        const decrypted = Buffer.concat([
            decipher.update(encryptedContent),
            decipher.final(),
        ]);

        return decrypted.toString("utf8");
    } catch (error) {
        console.error("Encryption Decryption Error:", error);
        throw new Error("Failed to decrypt data: Authentication failed or corrupted content");
    }
}

function getEncryptionKey(): Buffer {
    const keyStr = process.env.ENCRYPTION_KEY;
    if (!keyStr) {
        // Fallback for development if not provided, but show warning
        if (process.env.NODE_ENV === "production") {
            throw new Error("ENCRYPTION_KEY is required in production");
        }
        // Use a stable dummy key for dev if needed, or better, just fail
        throw new Error("ENCRYPTION_KEY environment variable is missing");
    }

    // Key should be 32 bytes. If hex, decode it.
    if (keyStr.length === 64) {
        return Buffer.from(keyStr, "hex");
    }

    // If not hex, use a hash to ensure correct length
    return crypto.createHash("sha256").update(keyStr).digest();
}
