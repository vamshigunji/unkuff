import { BaseProvider } from "../base-provider";
import { ProviderConfig, IngestionResult, NormalizedJob } from "../types";

/**
 * Base class for REST API based job aggregators.
 */
export abstract class BaseAggregator extends BaseProvider {
    protected abstract readonly apiUrl: string;

    /**
     * Helper to perform fetch requests with error handling.
     */
    protected async apiFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
        const response = await fetch(`${this.apiUrl}/${endpoint}`, {
            method: options.method || "GET",
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...options.headers,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error (${response.status}): ${errorText}`);
        }

        return response.json();
    }
}
