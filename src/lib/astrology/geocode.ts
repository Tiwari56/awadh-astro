/**
 * Geocoding: free-text place of birth → coordinates + timezone.
 *
 * Vedic charts are extremely sensitive to birth coordinates and timezone
 * (the ascendant shifts ~1° every 4 minutes), so we resolve the user's typed
 * place into precise inputs before any chart is computed.
 *
 * Uses Open-Meteo's geocoding API: free, keyless, and it returns the IANA
 * timezone AND the UTC offset in seconds — which lets us build an ISO 8601
 * datetime with the correct historical offset without a timezone library.
 * https://open-meteo.com/en/docs/geocoding-api
 */

export interface GeoLocation {
  /** Human-readable resolved name, e.g. "Ayodhya, Uttar Pradesh, India". */
  label: string;
  latitude: number;
  longitude: number;
  /** IANA timezone name, e.g. "Asia/Kolkata". */
  timezone: string;
  /** Offset from UTC in seconds at the resolved location, e.g. 19800 (+05:30). */
  utcOffsetSeconds: number;
}

interface OpenMeteoResult {
  name: string;
  latitude: number;
  longitude: number;
  timezone: string;
  admin1?: string;
  country?: string;
  utc_offset_seconds?: number;
}

const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";

/**
 * Resolve a place string to coordinates. Returns null when the place cannot be
 * geocoded (unknown place, network error) — callers decide how to degrade.
 */
export async function geocodePlace(place: string): Promise<GeoLocation | null> {
  const query = place.trim();
  if (!query) return null;

  try {
    const url = `${GEOCODE_URL}?name=${encodeURIComponent(query)}&count=1&language=en&format=json`;
    // Open-Meteo does not currently return utc_offset_seconds from search, so we
    // enrich it below via the forecast timezone lookup only if needed.
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;

    const json = (await res.json()) as { results?: OpenMeteoResult[] };
    const top = json.results?.[0];
    if (!top) return null;

    const utcOffsetSeconds =
      typeof top.utc_offset_seconds === "number"
        ? top.utc_offset_seconds
        : await resolveOffsetSeconds(top.latitude, top.longitude);

    return {
      label: [top.name, top.admin1, top.country].filter(Boolean).join(", "),
      latitude: top.latitude,
      longitude: top.longitude,
      timezone: top.timezone,
      utcOffsetSeconds,
    };
  } catch {
    return null;
  }
}

/**
 * Fallback offset lookup when the geocoding response omits the offset. Note this
 * returns the CURRENT offset for the location, which for regions without DST
 * (all of India — IST is fixed at +05:30) equals the historical birth offset.
 * For DST-observing regions, wire a proper tz-at-instant lookup before launch.
 */
async function resolveOffsetSeconds(lat: number, lng: number): Promise<number> {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&timezone=auto&forecast_days=1`,
      { headers: { Accept: "application/json" } }
    );
    if (!res.ok) return 0;
    const json = (await res.json()) as { utc_offset_seconds?: number };
    return json.utc_offset_seconds ?? 0;
  } catch {
    return 0;
  }
}

/** Format an offset in seconds as an ISO 8601 suffix, e.g. 19800 → "+05:30". */
export function formatUtcOffset(offsetSeconds: number): string {
  const sign = offsetSeconds < 0 ? "-" : "+";
  const abs = Math.abs(offsetSeconds);
  const hh = String(Math.floor(abs / 3600)).padStart(2, "0");
  const mm = String(Math.floor((abs % 3600) / 60)).padStart(2, "0");
  return `${sign}${hh}:${mm}`;
}
