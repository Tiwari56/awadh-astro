import { NextRequest, NextResponse } from "next/server";

/**
 * Place-search proxy for the PlaceAutocomplete component — every "place of
 * birth" / "city" field in the app should be a pick-from-a-list, not free
 * text, so we always geocode something the user actually confirmed rather
 * than a typo or an ambiguous name. Server-side proxy (rather than calling
 * Open-Meteo directly from the browser) keeps this consistent with the rest
 * of the app's "thin API route in front of an external service" pattern.
 */

interface OpenMeteoResult {
  name: string;
  latitude: number;
  longitude: number;
  admin1?: string;
  country?: string;
}

export interface PlaceSuggestion {
  label: string;
  latitude: number;
  longitude: number;
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ results: [] });

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=en&format=json`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return NextResponse.json({ results: [] });

    const json = (await res.json()) as { results?: OpenMeteoResult[] };
    const results: PlaceSuggestion[] = (json.results ?? []).map((r) => ({
      label: [r.name, r.admin1, r.country].filter(Boolean).join(", "),
      latitude: r.latitude,
      longitude: r.longitude,
    }));
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
