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

/** "1994-03-21" + "04:35" + 19800s → "1994-03-21T04:35:00+05:30". Shared by every provider. */
export function buildIsoDatetime(dateOfBirth: string, timeOfBirth: string, utcOffsetSeconds: number): string {
  return `${dateOfBirth}T${timeOfBirth}:00${formatUtcOffset(utcOffsetSeconds)}`;
}

/**
 * Geocode a place and resolve it to a full birth context (coordinates + ISO
 * datetime), falling back to Ayodhya/IST — sensible for this platform's core
 * audience — when the place can't be geocoded. Shared by kundali + matching
 * so both degrade the same way instead of duplicating this fallback logic.
 */
export async function resolveBirthLocation(
  placeOfBirth: string,
  dateOfBirth: string,
  timeOfBirth: string
): Promise<{ location: GeoLocation; datetime: string; geocoded: boolean }> {
  const found = await geocodePlace(placeOfBirth);
  const location = found ?? {
    label: placeOfBirth || "Ayodhya, Uttar Pradesh, India",
    latitude: 26.7922,
    longitude: 82.1998,
    timezone: "Asia/Kolkata",
    utcOffsetSeconds: 19800,
  };
  return {
    location,
    datetime: buildIsoDatetime(dateOfBirth, timeOfBirth, location.utcOffsetSeconds),
    geocoded: found !== null,
  };
}
