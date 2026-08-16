import type { BirthDetails, KundaliResult } from "@/types";
import { astrologyConfig, isProkeralaConfigured } from "./config";
import { resolveBirthLocation } from "./geocode";
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
  const { location, datetime, geocoded } = await resolveBirthLocation(
    details.placeOfBirth,
    details.dateOfBirth,
    details.timeOfBirth,
    details.timeUnknown
  );

  // Real provider requires a real geocode. If that failed or Prokerala isn't
  // configured, degrade to the mock so the free-kundali hook never 500s.
  const useProkerala = isProkeralaConfigured() && geocoded;
  const provider: AstrologyProvider = useProkerala ? prokeralaProvider : mockProvider;
  const ctx: BirthContext = { details, location, datetime };

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

export { astrologyConfig };
export type { BirthContext } from "./provider";
