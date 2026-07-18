import type { BirthDetails, KundaliResult } from "@/types";
import { astrologyConfig, isProkeralaConfigured } from "./config";
import { formatUtcOffset, geocodePlace, type GeoLocation } from "./geocode";
import type { AstrologyProvider, BirthContext } from "./provider";
import { mockProvider } from "./providers/mock";
import { prokeralaProvider } from "./providers/prokerala";

/**
 * Kundali computation entry point (unchanged signature — callers still just pass
 * BirthDetails). Internally this now:
 *   1. geocodes the place of birth → coordinates + timezone offset,
 *   2. builds an ISO 8601 birth datetime with the correct offset,
 *   3. dispatches to the configured provider (Prokerala when credentialed),
 *   4. falls back to the deterministic mock if the real path is unavailable.
 *
 * Never computes planetary positions with an LLM.
 */
export async function computeKundali(details: BirthDetails): Promise<KundaliResult> {
  const location = await geocodePlace(details.placeOfBirth);

  // Real provider requires geocoded coordinates. If geocoding failed or Prokerala
  // isn't configured, degrade to the mock so the free-kundali hook never 500s.
  const useProkerala = isProkeralaConfigured() && location !== null;
  const provider: AstrologyProvider = useProkerala ? prokeralaProvider : mockProvider;

  const resolvedLocation: GeoLocation = location ?? fallbackLocation(details.placeOfBirth);
  const ctx: BirthContext = {
    details,
    location: resolvedLocation,
    datetime: buildIsoDatetime(details, resolvedLocation.utcOffsetSeconds),
  };

  try {
    return await provider.computeKundali(ctx);
  } catch (err) {
    // A real-provider outage should not break the user's free kundali; log and
    // serve the mock. Swap console for your structured logger in production.
    if (provider !== mockProvider) {
      console.error("[astrology] provider failed, falling back to mock:", err);
      return mockProvider.computeKundali(ctx);
    }
    throw err;
  }
}

/** "1994-03-21" + "04:35" + 19800s → "1994-03-21T04:35:00+05:30". */
function buildIsoDatetime(details: BirthDetails, utcOffsetSeconds: number): string {
  return `${details.dateOfBirth}T${details.timeOfBirth}:00${formatUtcOffset(utcOffsetSeconds)}`;
}

/**
 * Placeholder location used only on the mock path when geocoding is unavailable.
 * Defaults to Ayodhya / IST — sensible for this platform's core audience and
 * irrelevant to the mock's (deterministic, place-independent) output.
 */
function fallbackLocation(label: string): GeoLocation {
  return {
    label: label || "Ayodhya, Uttar Pradesh, India",
    latitude: 26.7922,
    longitude: 82.1998,
    timezone: "Asia/Kolkata",
    utcOffsetSeconds: 19800,
  };
}

export { astrologyConfig };
export type { BirthContext } from "./provider";
