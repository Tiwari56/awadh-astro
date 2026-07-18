/**
 * Astrology provider configuration (env-driven).
 *
 * Set ASTROLOGY_PROVIDER=prokerala and the Prokerala credentials to switch from
 * the built-in deterministic mock to real Swiss-Ephemeris computation.
 * With no credentials the platform silently falls back to the mock so local dev
 * and the free-kundali acquisition hook keep working without secrets.
 */

export type AstrologyProviderName = "mock" | "prokerala";

/**
 * Ayanamsa (sidereal offset). Prokerala: 1 = Lahiri (Indian govt. standard,
 * the correct default for Vedic/Jyotish charts), 3 = Raman, 5 = KP.
 */
const DEFAULT_AYANAMSA = 1;

export const astrologyConfig = {
  provider: (process.env.ASTROLOGY_PROVIDER as AstrologyProviderName) || "mock",
  ayanamsa: Number(process.env.ASTROLOGY_AYANAMSA) || DEFAULT_AYANAMSA,
  prokerala: {
    clientId: process.env.PROKERALA_CLIENT_ID,
    clientSecret: process.env.PROKERALA_CLIENT_SECRET,
    baseUrl: process.env.PROKERALA_BASE_URL || "https://api.prokerala.com",
  },
} as const;

/** True only when Prokerala is selected AND fully credentialed. */
export function isProkeralaConfigured(): boolean {
  return (
    astrologyConfig.provider === "prokerala" &&
    Boolean(astrologyConfig.prokerala.clientId) &&
    Boolean(astrologyConfig.prokerala.clientSecret)
  );
}
