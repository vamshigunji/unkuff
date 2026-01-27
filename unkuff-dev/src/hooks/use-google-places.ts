// Google Places Autocomplete hook using our API route
import { useState, useCallback, useRef, useEffect } from 'react';

export interface PlacePrediction {
    placeId: string;
    description: string;
    mainText: string;
    secondaryText: string;
}

interface UseGooglePlacesAutocompleteOptions {
    countryCode?: string;
    debounceMs?: number;
}

export function useGooglePlacesAutocomplete(options: UseGooglePlacesAutocompleteOptions = {}) {
    const { countryCode, debounceMs = 300 } = options;
    const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const searchPlaces = useCallback(async (input: string) => {
        // Clear previous debounce
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        // Cancel previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        if (!input || input.length < 2) {
            setPredictions([]);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            setIsLoading(true);
            setError(null);

            try {
                abortControllerRef.current = new AbortController();

                const params = new URLSearchParams({ input });
                if (countryCode) {
                    params.append('countryCode', countryCode);
                }

                const response = await fetch(
                    `/api/places/autocomplete?${params}`,
                    { signal: abortControllerRef.current.signal }
                );

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch places');
                }

                const data = await response.json();
                setPredictions(data.predictions || []);
            } catch (err) {
                if (err instanceof Error && err.name !== 'AbortError') {
                    setError(err.message);
                    setPredictions([]);
                }
            } finally {
                setIsLoading(false);
            }
        }, debounceMs);
    }, [countryCode, debounceMs]);

    const clearPredictions = useCallback(() => {
        setPredictions([]);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    return {
        predictions,
        isLoading,
        error,
        searchPlaces,
        clearPredictions,
    };
}
