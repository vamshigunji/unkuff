import crypto from "crypto";

/**
 * Generates a consistent hash for a job based on title and company.
 * Used for deduplication.
 */
export function calculateJobHash(title: string, company: string): string {
    const clean = (str: string) =>
        str.toLowerCase()
            .trim()
            .replace(/\s+/g, " ")
            .replace(/[^a-z0-9 ]/g, "");

    const normalizedTitle = clean(title);
    const normalizedCompany = clean(company);

    return crypto
        .createHash("md5")
        .update(`${normalizedTitle}|${normalizedCompany}`)
        .digest("hex");
}
