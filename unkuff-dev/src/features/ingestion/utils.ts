import crypto from "crypto";

/**
 * Generates a consistent hash for a job based on title, company, location, and city.
 * Used for deduplication.
 */
export function calculateJobHash(title: string, company: string, location?: string, city?: string): string {
    const clean = (str: string) =>
        (str || "")
            .toLowerCase()
            .trim()
            .replace(/\s+/g, " ")
            .replace(/[^a-z0-9 ]/g, "");

    const normalizedTitle = clean(title);
    const normalizedCompany = clean(company);
    const normalizedLocation = clean(location || "");
    const normalizedCity = clean(city || "");

    return crypto
        .createHash("md5")
        .update(`${normalizedTitle}|${normalizedCompany}|${normalizedLocation}|${normalizedCity}`)
        .digest("hex");
}
