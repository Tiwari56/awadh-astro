import type { KundaliResult } from "@/types";
import type { AstrologyProvider, BirthContext } from "../provider";

/**
 * Deterministic mock provider — output is a pure function of the birth details,
 * so the same person always gets the same (fake) chart. Used for local dev and
 * as the keyless fallback that keeps the free-kundali hook alive without secrets.
 *
 * NOT astrologically valid. Never present mock output as a real reading in prod;
 * gate it behind a non-production environment check at the surface if needed.
 */
export const mockProvider: AstrologyProvider = {
  name: "mock",
  async computeKundali(ctx: BirthContext): Promise<KundaliResult> {
    const { details } = ctx;
    const signs = [
      "Mesha (Aries)", "Vrishabha (Taurus)", "Mithuna (Gemini)", "Karka (Cancer)",
      "Simha (Leo)", "Kanya (Virgo)", "Tula (Libra)", "Vrishchika (Scorpio)",
      "Dhanu (Sagittarius)", "Makara (Capricorn)", "Kumbha (Aquarius)", "Meena (Pisces)",
    ];
    const nakshatras = [
      "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
      "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    ];
    const planets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];

    const seed = hashString(details.name + details.dateOfBirth + details.timeOfBirth);
    const pick = <T,>(arr: T[], offset: number): T => arr[(seed + offset) % arr.length];

    return {
      ascendant: pick(signs, 0),
      moonSign: pick(signs, 3),
      sunSign: pick(signs, 7),
      nakshatra: pick(nakshatras, 2),
      currentDasha: `${pick(planets, 4)} Mahadasha`,
      planets: planets.map((planet, i) => ({
        planet,
        sign: pick(signs, i * 2),
        house: ((seed + i * 3) % 12) + 1,
        degree: Math.round((((seed * (i + 1)) % 3000) / 100) * 10) / 10,
        retrograde: (seed + i) % 5 === 0,
      })),
      dailyInsight:
        "Today favours steady effort over bold moves. A conversation with an elder brings clarity. Avoid major purchases after sunset.",
    };
  },
};

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}
