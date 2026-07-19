import type {
  DashaPeriod as DashaPeriodType,
  DoshaSummary,
  KundaliResult,
  PlanetPosition,
} from "@/types";
import { astrologyConfig } from "../config";
import type { AstrologyProvider, BirthContext } from "../provider";

/**
 * Prokerala v2 provider (Swiss-Ephemeris backed).
 * Docs: https://api.prokerala.com/docs
 *
 * Auth is OAuth2 client-credentials; tokens are cached in-process until shortly
 * before expiry. A full enriched kundali pulls several endpoints:
 *   - /v2/astrology/planet-position  → ascendant + planet table (sign/house/deg/nakshatra)
 *   - /v2/astrology/birth-details    → moon/sun rasi, nakshatra, lucky attributes
 *   - /v2/astrology/dasha-periods    → mahadasha + running antardasha
 *   - /v2/astrology/panchang         → tithi/vara/yoga/karana (birth almanac)
 *   - /v2/astrology/mangal-dosha     → Manglik status
 *   - /v2/astrology/kaal-sarp-dosha  → Kaal Sarp status
 *
 * The core three endpoints are required; the enrichment endpoints are fetched
 * "safely" (null on failure) so a missing entitlement/shape drift degrades
 * gracefully instead of breaking the free kundali.
 *
 * IMPORTANT: exact field names below follow Prokerala's documented v2 shapes but
 * MUST be verified against live responses on first integration — mapping is
 * defensive (optional chaining + fallbacks). Positions come from the ephemeris;
 * no LLM is involved here.
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

/** Enrichment fetch that never throws — returns null so the chart still renders. */
async function prokeralaGetSafe<T>(path: string, ctx: BirthContext): Promise<T | null> {
  try {
    return await prokeralaGet<T>(path, ctx);
  } catch {
    return null;
  }
}

// --- Response shapes (subset we consume) --------------------------------------

interface Rasi { id?: number; name?: string; }
interface NakshatraInfo { name?: string; pada?: number; }

interface PlanetEntry {
  name?: string;
  is_retrograde?: boolean;
  position?: number; // house number 1..12
  degree?: number;
  rasi?: Rasi;
  nakshatra?: NakshatraInfo;
  basic_avastha?: string; // some plans expose dignity/avastha here
  dignity?: string;
}
interface PlanetPositionData { planet_position?: PlanetEntry[]; }

interface BirthDetailsData {
  nakshatra?: NakshatraInfo;
  chandra_rasi?: Rasi;
  soorya_rasi?: Rasi;
  additional_info?: {
    lucky_gem?: string;
    lucky_number?: number | string;
    lucky_colour?: string;
    lucky_color?: string;
    favroute_direction?: string;
    favorable_direction?: string;
  };
}

interface RawDasha {
  start?: string;
  end?: string;
  name?: string;
  planet?: { name?: string };
  antardasha?: RawDasha[];
}
interface DashaData { dasha_periods?: RawDasha[]; }

interface PanchangData {
  tithi?: { name?: string; paksha?: string };
  vaara?: string;
  nakshatra?: { name?: string };
  yoga?: { name?: string };
  karana?: { name?: string };
}

interface DoshaData {
  has_dosha?: boolean;
  description?: string;
  // mangal dosha specific
  has_mangal_dosha?: boolean;
  mangal_dosha?: { has_dosha?: boolean; description?: string };
}

// --- Sign formatting ----------------------------------------------------------

const SIGN_BY_ID: Record<number, string> = {
  1: "Mesha (Aries)", 2: "Vrishabha (Taurus)", 3: "Mithuna (Gemini)",
  4: "Karka (Cancer)", 5: "Simha (Leo)", 6: "Kanya (Virgo)",
  7: "Tula (Libra)", 8: "Vrishchika (Scorpio)", 9: "Dhanu (Sagittarius)",
  10: "Makara (Capricorn)", 11: "Kumbha (Aquarius)", 12: "Meena (Pisces)",
};

function formatRasi(rasi?: Rasi): string {
  if (rasi?.id && SIGN_BY_ID[rasi.id]) return SIGN_BY_ID[rasi.id];
  return rasi?.name ?? "—";
}

function toDoshaSummary(data: DoshaData | null, absentMsg: string): DoshaSummary {
  const present = Boolean(data?.has_dosha ?? data?.has_mangal_dosha ?? data?.mangal_dosha?.has_dosha);
  const description = data?.description ?? data?.mangal_dosha?.description;
  return {
    present,
    severity: present ? "Moderate" : "None",
    summary: description ?? (present ? "Dosha present in the chart." : absentMsg),
  };
}

// --- Provider -----------------------------------------------------------------

export const prokeralaProvider: AstrologyProvider = {
  name: "prokerala",
  async computeKundali(ctx: BirthContext): Promise<KundaliResult> {
    // Required core data.
    const [positions, birth, dasha] = await Promise.all([
      prokeralaGet<PlanetPositionData>("/v2/astrology/planet-position", ctx),
      prokeralaGet<BirthDetailsData>("/v2/astrology/birth-details", ctx),
      prokeralaGet<DashaData>("/v2/astrology/dasha-periods", ctx),
    ]);
    // Optional enrichment (never breaks the chart).
    const [panchang, mangal, kaalSarp] = await Promise.all([
      prokeralaGetSafe<PanchangData>("/v2/astrology/panchang", ctx),
      prokeralaGetSafe<DoshaData>("/v2/astrology/mangal-dosha", ctx),
      prokeralaGetSafe<DoshaData>("/v2/astrology/kaal-sarp-dosha", ctx),
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
        nakshatra: e.nakshatra?.name ?? "—",
        pada: e.nakshatra?.pada ?? 0,
        dignity: e.dignity ?? e.basic_avastha ?? "—",
      }));

    const { mahadasha, antardasha } = extractDasha(dasha);
    const info = birth.additional_info;

    return {
      ascendant: formatRasi(ascendantEntry?.rasi),
      moonSign: formatRasi(birth.chandra_rasi),
      sunSign: formatRasi(birth.soorya_rasi),
      nakshatra: birth.nakshatra?.name ?? "—",
      currentDasha: `${mahadasha.planet} Mahadasha`,
      planets,
      // Narrative interpretation is the chat LLM's job (seam #2), not here.
      dailyInsight:
        "Your chart has been computed from your exact birth details. Ask an astrologer or the AI guide to interpret what it means for you today.",

      panchang: {
        tithi: panchang?.tithi?.name ?? "—",
        vara: panchang?.vaara ?? "—",
        nakshatra: panchang?.nakshatra?.name ?? birth.nakshatra?.name ?? "—",
        yoga: panchang?.yoga?.name ?? "—",
        karana: panchang?.karana?.name ?? "—",
        moonPhase: panchang?.tithi?.paksha ?? "—",
      },
      mahadasha,
      antardasha,
      mangalDosha: toDoshaSummary(mangal, "No Mangal Dosha detected."),
      // Prokerala does not expose a single "sade sati" boolean on the base plan;
      // verify the correct endpoint for your tier and wire it here. Neutral default:
      sadeSati: { present: false, severity: "None", summary: "Sade Sati status not available on the current plan." },
      kaalSarpDosha: toDoshaSummary(kaalSarp, "No Kaal Sarp Dosha detected."),
      // Yoga detection needs the yoga-details endpoint (higher tier) — left empty
      // until wired; UI hides the section when there are none.
      yogas: [],
      luckyGem: info?.lucky_gem ?? "—",
      luckyNumber: Number(info?.lucky_number) || 0,
      luckyColor: info?.lucky_colour ?? info?.lucky_color ?? "—",
      favorableDirection: info?.favroute_direction ?? info?.favorable_direction ?? "—",
    };
  },
};

/** Extract the running mahadasha and its active antardasha from the timeline. */
function extractDasha(dasha: DashaData): { mahadasha: DashaPeriodType; antardasha: DashaPeriodType } {
  const now = Date.now();
  const within = (p: RawDasha) => {
    const s = p.start ? Date.parse(p.start) : NaN;
    const e = p.end ? Date.parse(p.end) : NaN;
    return !Number.isNaN(s) && !Number.isNaN(e) && now >= s && now <= e;
  };
  const periods = dasha.dasha_periods ?? [];
  const maha = periods.find(within) ?? periods[0];
  const antar = maha?.antardasha?.find(within) ?? maha?.antardasha?.[0];

  const toPeriod = (p?: RawDasha): DashaPeriodType => ({
    planet: p?.planet?.name ?? p?.name ?? "—",
    start: (p?.start ?? "").slice(0, 10),
    end: (p?.end ?? "").slice(0, 10),
  });

  return { mahadasha: toPeriod(maha), antardasha: toPeriod(antar) };
}
