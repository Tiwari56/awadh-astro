import type { KundaliResult, PlanetPosition } from "@/types";
import { astrologyConfig } from "../config";
import type { AstrologyProvider, BirthContext } from "../provider";

/**
 * Prokerala v2 provider (Swiss-Ephemeris backed).
 * Docs: https://api.prokerala.com/docs
 *
 * Auth is OAuth2 client-credentials; tokens are cached in-process until shortly
 * before expiry. Each kundali needs three endpoints:
 *   - /v2/astrology/planet-position  → ascendant + planet table
 *   - /v2/astrology/birth-details    → moon/sun rasi + nakshatra
 *   - /v2/astrology/dasha-periods    → current mahadasha
 *
 * NOTE: field names below follow Prokerala's documented v2 shapes but MUST be
 * verified against live responses on first integration — mapping is defensive
 * (optional chaining + fallbacks) so a shape drift degrades gracefully rather
 * than throwing. Positions come from the ephemeris; no LLM is involved here.
 */

interface CachedToken {
  accessToken: string;
  expiresAt: number; // epoch ms
}

let tokenCache: CachedToken | null = null;

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now + 60_000) {
    return tokenCache.accessToken;
  }

  const { clientId, clientSecret, baseUrl } = astrologyConfig.prokerala;
  const res = await fetch(`${baseUrl}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId!,
      client_secret: clientSecret!,
    }),
  });

  if (!res.ok) {
    throw new Error(`Prokerala auth failed: ${res.status} ${await res.text()}`);
  }

  const json = (await res.json()) as { access_token: string; expires_in: number };
  tokenCache = {
    accessToken: json.access_token,
    expiresAt: now + json.expires_in * 1000,
  };
  return json.access_token;
}

async function prokeralaGet<T>(path: string, ctx: BirthContext): Promise<T> {
  const token = await getAccessToken();
  const { baseUrl } = astrologyConfig.prokerala;
  const params = new URLSearchParams({
    ayanamsa: String(astrologyConfig.ayanamsa),
    coordinates: `${ctx.location.latitude},${ctx.location.longitude}`,
    datetime: ctx.datetime,
  });

  const res = await fetch(`${baseUrl}${path}?${params}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Prokerala ${path} failed: ${res.status} ${await res.text()}`);
  }
  const json = (await res.json()) as { data?: T };
  if (!json.data) throw new Error(`Prokerala ${path} returned no data`);
  return json.data;
}

// --- Response shapes (subset we consume) --------------------------------------

interface Rasi {
  id?: number;
  name?: string;
}

interface PlanetEntry {
  name?: string;
  is_retrograde?: boolean;
  position?: number; // house number 1..12
  degree?: number;
  rasi?: Rasi;
}

interface PlanetPositionData {
  planet_position?: PlanetEntry[];
}

interface BirthDetailsData {
  nakshatra?: { name?: string };
  chandra_rasi?: Rasi; // moon sign
  soorya_rasi?: Rasi; // sun sign
}

interface DashaPeriod {
  start?: string;
  end?: string;
  name?: string;
  planet?: { name?: string };
}

interface DashaData {
  dasha_periods?: DashaPeriod[];
}

// --- Sign formatting ----------------------------------------------------------

const SIGN_BY_ID: Record<number, string> = {
  1: "Mesha (Aries)", 2: "Vrishabha (Taurus)", 3: "Mithuna (Gemini)",
  4: "Karka (Cancer)", 5: "Simha (Leo)", 6: "Kanya (Virgo)",
  7: "Tula (Libra)", 8: "Vrishchika (Scorpio)", 9: "Dhanu (Sagittarius)",
  10: "Makara (Capricorn)", 11: "Kumbha (Aquarius)", 12: "Meena (Pisces)",
};

/** Prefer our bilingual label by rasi id; fall back to the API's raw name. */
function formatRasi(rasi?: Rasi): string {
  if (rasi?.id && SIGN_BY_ID[rasi.id]) return SIGN_BY_ID[rasi.id];
  return rasi?.name ?? "—";
}

// --- Provider -----------------------------------------------------------------

export const prokeralaProvider: AstrologyProvider = {
  name: "prokerala",
  async computeKundali(ctx: BirthContext): Promise<KundaliResult> {
    const [positions, birth, dasha] = await Promise.all([
      prokeralaGet<PlanetPositionData>("/v2/astrology/planet-position", ctx),
      prokeralaGet<BirthDetailsData>("/v2/astrology/birth-details", ctx),
      prokeralaGet<DashaData>("/v2/astrology/dasha-periods", ctx),
    ]);

    const entries = positions.planet_position ?? [];
    const ascendantEntry = entries.find((e) => e.name?.toLowerCase() === "ascendant");

    const planets: PlanetPosition[] = entries
      .filter((e) => e.name && e.name.toLowerCase() !== "ascendant")
      .map((e) => ({
        planet: e.name!,
        sign: formatRasi(e.rasi),
        house: e.position ?? 0,
        degree: typeof e.degree === "number" ? Math.round(e.degree * 10) / 10 : 0,
        retrograde: Boolean(e.is_retrograde),
      }));

    return {
      ascendant: formatRasi(ascendantEntry?.rasi),
      moonSign: formatRasi(birth.chandra_rasi),
      sunSign: formatRasi(birth.soorya_rasi),
      nakshatra: birth.nakshatra?.name ?? "—",
      currentDasha: formatCurrentDasha(dasha),
      planets,
      // Interpretation is intentionally NOT generated here. The chart is factual
      // ephemeris data; narrative "insight" is the chat LLM's job (seam #2),
      // grounded on this chart. Keep this neutral and non-predictive for now.
      dailyInsight:
        "Your chart has been computed from your exact birth details. Ask an astrologer or the AI guide to interpret what it means for you today.",
    };
  },
};

/** Pick the mahadasha period that contains 'now'; fall back to the first. */
function formatCurrentDasha(dasha: DashaData): string {
  const periods = dasha.dasha_periods ?? [];
  const now = Date.now();
  const current =
    periods.find((p) => {
      const start = p.start ? Date.parse(p.start) : NaN;
      const end = p.end ? Date.parse(p.end) : NaN;
      return !Number.isNaN(start) && !Number.isNaN(end) && now >= start && now <= end;
    }) ?? periods[0];

  const lord = current?.planet?.name ?? current?.name;
  return lord ? `${lord} Mahadasha` : "—";
}
