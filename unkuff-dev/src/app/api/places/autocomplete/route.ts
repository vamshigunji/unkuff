// API route for Google Places Autocomplete (to avoid CORS issues)
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const input = searchParams.get('input');
    const countryCode = searchParams.get('countryCode');

    if (!input || input.length < 2) {
        return NextResponse.json({ predictions: [] });
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
        return NextResponse.json(
            { error: 'Google Places API key not configured' },
            { status: 500 }
        );
    }

    try {
        // Build request for Places Autocomplete API
        const params = new URLSearchParams({
            input,
            types: '(cities)',
            key: apiKey,
        });

        if (countryCode) {
            params.append('components', `country:${countryCode.toLowerCase()}`);
        }

        const response = await fetch(
            `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch places');
        }

        const data = await response.json();

        if (data.status === 'OK') {
            const predictions = data.predictions.map((pred: {
                place_id: string;
                description: string;
                structured_formatting: {
                    main_text: string;
                    secondary_text: string;
                };
            }) => ({
                placeId: pred.place_id,
                description: pred.description,
                mainText: pred.structured_formatting.main_text,
                secondaryText: pred.structured_formatting.secondary_text || '',
            }));
            return NextResponse.json({ predictions });
        } else if (data.status === 'ZERO_RESULTS') {
            return NextResponse.json({ predictions: [] });
        } else {
            return NextResponse.json(
                { error: data.error_message || `API Error: ${data.status}` },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error('Google Places API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch place suggestions' },
            { status: 500 }
        );
    }
}
