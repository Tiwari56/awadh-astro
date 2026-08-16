import type {
  DashaPeriod as DashaPeriodType,
  DoshaSummary,
  KundaliResult,
  PlanetPosition,
  Yoga,
} from "@/types";
import { coordsParam, prokeralaGet, prokeralaGetSafe } from "./prokerala-client";
import type { AstrologyProvider, BirthContext } from "../provider";

/**
 * Prokerala v2 provider (Swiss-Ephemeris backed).
 *
 * Endpoints below were verified against Prokerala's published OpenAPI spec
 * (https://api.prokerala.com/spec/astrology.v2.yaml) and their own demo/docs
 * site in Aug 2026 — NOT guessed from memory. Two corrections vs. an earlier
 * draft of this file: there is no standalone `/dasha-periods` endpoint (dasha
 * lives inside `/kundli/advanced`), and the "lucky attributes" field names on
 * `/birth-details` are `birth_stone` / `color` / `direction`, not
 * `lucky_gem` / `lucky_colour` / `favorable_direction`.
 *
 * One endpoint could not be confirmed from the spec text despite being a real,
 * documented Prokerala feature (their own demo lists it under "Horoscope
 * Calculators"): `/astrology/planet-position`, used below for the planet
 * table and for the live Saturn transit (Sade Sati). Its exact JSON field
 * names are our best-effort mapping — verify against a live response at
 * https://api.prokerala.com/docs the first time real credentials are wired,
 * and adjust the `PlanetEntry` interface below if field names differ.
 *
 * RULE: no LLM is involved anywhere in this file. Positions come from the
 * ephemeris; narrative interpretation happens later, in the chat layer.
 */

// --- Response shapes (subset we consume) --------------------------------------

interface Rasi { id?: number; name?: string; }
interface NakshatraInfo { id?: number; name?: string; lord?: { name?: string }; pada?: number; }

interface PlanetEntry {
  name?: string;
  is_retrograde?: boolean;
  position?: number; // house number 1..12
  degree?: number;
  rasi?: Rasi;
  nakshatra?: NakshatraInfo;
  avastha?: string; // dignity — unconfirmed field name, see file header
}
interface PlanetPositionData { planet_position?: PlanetEntry[]; }

interface AdditionalInfo {
  deity?: string; ganam?: string; symbol?: string; animal_sign?: string; nadi?: string;
  color?: string; direction?: string; syllables?: string; birth_stone?: string;
  gender?: string; planet?: string; enemy_yoni?: string;
}

interface MangalDoshaBlock {
  has_dosha?: boolean;
  has_exception?: boolean;
  type?: string;
  exceptions?: string[];
  remedies?: string[];
  description?: string;
}

interface RawDasha {
  start?: string;
  end?: string;
  name?: string;
  planet?: { name?: string };
  antardasha?: RawDasha[];
}

interface YogaListItem { name?: string; has_yoga?: boolean; description?: string; }
interface YogaCategory { name?: string; yoga_list?: YogaListItem[]; }

/** `/v2/astrology/kundli/advanced` — the one big call covering birth details, mangal dosha, yogas, and dasha. */
interface KundliAdvancedData {
  nakshatra?: NakshatraInfo;
  chandra_rasi?: Rasi;
  soorya_rasi?: Rasi;
  additional_info?: AdditionalInfo;
  mangal_dosha?: MangalDoshaBlock;
  yoga_details?: YogaCategory[];
  dasha_periods?: RawDasha[];
}

interface PanchangEntry { name?: string; paksha?: string; }
interface PanchangData {
  vaara?: string;
  tithi?: PanchangEntry[];
  nakshatra?: PanchangEntry[];
  karana?: PanchangEntry[];
  yoga?: PanchangEntry[];
}

interface KaalSarpData { has_dosha?: boolean; type?: string; dosha_type?: string; description?: string; }

// --- Formatting helpers ---------------------------------------------------------

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

/**
 * Numerology "Life Path Number" from the date of birth (digit-sum, reduced to
 * 1–9). This is a DIFFERENT system from Vedic astrology (Chaldean/Pythagorean
 * numerology) — Prokerala's astrology API has no "lucky number" field because
 * that concept isn't part of Jyotish, so we compute it ourselves rather than
 * inventing a fake API field.
 */
function lifePathNumber(dateOfBirth: string): number {
  let n = dateOfBirth.replace(/\D/g, "").split("").reduce((s, d) => s + Number(d), 0);
  while (n > 9) n = String(n).split("").reduce((s, d) => s + Number(d), 0);
  return n || 1;
}

function requestParams(ctx: BirthContext): Record<string, string> {
  return { coordinates: coordsParam(ctx.location.latitude, ctx.location.longitude), datetime: ctx.datetime };
}

// --- Provider -----------------------------------------------------------------

export const prokeralaProvider: AstrologyProvider = {
  name: "prokerala",
  async computeKundali(ctx: BirthContext): Promise<KundaliResult> {
    const params = requestParams(ctx);

    // Required core data — one call covers birth details, mangal dosha, yogas, dasha.
    const kundli = await prokeralaGet<KundliAdvancedData>("/v2/astrology/kundli/advanced", params);

    // Enrichment — never breaks the chart if any of these fail or the plan lacks them.
    const [panchang, kaalSarp, planetPos, currentSaturn] = await Promise.all([
      prokeralaGetSafe<PanchangData>("/v2/astrology/panchang", params),
      prokeralaGetSafe<KaalSarpData>("/v2/astrology/kaal-sarp-dosha", params),
      prokeralaGetSafe<PlanetPositionData>("/v2/astrology/planet-position", params),
      // Live Saturn transit (today, not birth date) — used to compute real Sade Sati below.
      prokeralaGetSafe<PlanetPositionData>("/v2/astrology/planet-position", {
        coordinates: params.coordinates,
        datetime: new Date().toISOString().replace("Z", "+00:00"),
      }),
    ]);

    const planetEntries = planetPos?.planet_position ?? [];
    // NOTE: assumes the ascendant is returned as a planet_position entry named
    // "Ascendant" — the common pattern for this class of API, unconfirmed for
    // Prokerala specifically (see file header). Falls back to "—" if absent.
    const ascendantEntry = planetEntries.find((e) => e.name?.toLowerCase() === "ascendant");
    const planets: PlanetPosition[] = planetEntries
      .filter((e) => e.name && e.name.toLowerCase() !== "ascendant")
      .map((e) => ({
        planet: e.name!,
        sign: formatRasi(e.rasi),
        house: e.position ?? 0,
        degree: typeof e.degree === "number" ? Math.round(e.degree * 10) / 10 : 0,
        retrograde: Boolean(e.is_retrograde),
        nakshatra: e.nakshatra?.name ?? "—",
        pada: e.nakshatra?.pada ?? 0,
        dignity: e.avastha ?? "—",
      }));

    const { mahadasha, antardasha } = extractDasha(kundli.dasha_periods ?? []);
    const info = kundli.additional_info;

    return {
      ascendant: formatRasi(ascendantEntry?.rasi),
      moonSign: formatRasi(kundli.chandra_rasi),
      sunSign: formatRasi(kundli.soorya_rasi),
      nakshatra: kundli.nakshatra?.name ?? "—",
      currentDasha: `${mahadasha.planet} Mahadasha`,
      planets,
      // Narrative interpretation is the chat LLM's job (seam #2), not here.
      dailyInsight:
        "Your chart has been computed from your exact birth details. Ask an astrologer or the AI guide to interpret what it means for you today.",

      panchang: {
        // Panchang elements can change mid-day; Prokerala returns them as
        // arrays. We take the element active at query time (first entry) —
        // fine for a birth-panchang display since we query with the exact
        // birth datetime.
        tithi: panchang?.tithi?.[0]?.name ?? "—",
        vara: panchang?.vaara ?? "—",
        nakshatra: panchang?.nakshatra?.[0]?.name ?? kundli.nakshatra?.name ?? "—",
        yoga: panchang?.yoga?.[0]?.name ?? "—",
        karana: panchang?.karana?.[0]?.name ?? "—",
        moonPhase: panchang?.tithi?.[0]?.paksha ?? "—",
      },
      mahadasha,
      antardasha,
      mangalDosha: formatMangalDosha(kundli.mangal_dosha),
      sadeSati: computeSadeSati(kundli.chandra_rasi?.id, currentSaturn?.planet_position),
      kaalSarpDosha: formatKaalSarp(kaalSarp),
      yogas: extractYogas(kundli.yoga_details),
      luckyGem: info?.birth_stone ?? "—",
      luckyNumber: lifePathNumber(ctx.details.dateOfBirth),
      luckyColor: info?.color ?? "—",
      favorableDirection: info?.direction ?? "—",
    };
  },
};

function formatMangalDosha(m?: MangalDoshaBlock): DoshaSummary {
  const present = Boolean(m?.has_dosha);
  const parts = [m?.description];
  if (present && m?.has_exception) parts.push(`Exception applies: ${(m.exceptions ?? []).join("; ") || m.type}.`);
  if (present && m?.remedies?.length) parts.push(`Suggested remedy: ${m.remedies[0]}.`);
  return {
    present,
    severity: present ? (m?.has_exception ? "Low" : "Moderate") : "None",
    summary: parts.filter(Boolean).join(" ") || (present ? "Mangal Dosha present in the chart." : "No Mangal Dosha detected. Mars is not in a Manglik position."),
  };
}

function formatKaalSarp(k: KaalSarpData | null): DoshaSummary {
  const present = Boolean(k?.has_dosha);
  return {
    present,
    severity: present ? "Low" : "None",
    summary: k?.description ?? (present ? `${k?.dosha_type ?? "Kaal Sarp"} Yoga present.` : "No Kaal Sarp Dosha detected."),
  };
}

/**
 * Real Sade Sati computation: Saturn's CURRENT transiting sign compared to the
 * NATAL Moon's sign. Classically active when Saturn transits the 12th, 1st
 * (peak/"Madhya"), or 2nd sign counted from natal Moon.
 */
function computeSadeSati(moonRasiId: number | undefined, saturnNow?: PlanetEntry[]): DoshaSummary {
  const saturn = saturnNow?.find((e) => e.name?.toLowerCase() === "saturn");
  const saturnRasiId = saturn?.rasi?.id;
  if (!moonRasiId || !saturnRasiId) {
    return { present: false, severity: "None", summary: "Sade Sati status could not be computed (transit data unavailable)." };
  }
  const houseFromMoon = ((saturnRasiId - moonRasiId + 12) % 12) + 1; // 1..12, Moon's own sign = 1
  const active = houseFromMoon === 12 || houseFromMoon === 1 || houseFromMoon === 2;
  if (!active) {
    return { present: false, severity: "None", summary: "You are not currently in Sade Sati. Saturn is not transiting near your Moon sign." };
  }
  const phase = houseFromMoon === 12 ? "rising (first) phase" : houseFromMoon === 1 ? "peak (second) phase — traditionally the most intense" : "setting (third) phase";
  return {
    present: true,
    severity: houseFromMoon === 1 ? "High" : "Moderate",
    summary: `Saturn is currently transiting the ${phase} of Sade Sati relative to your natal Moon. A period for patience, discipline and remedies.`,
  };
}

function extractYogas(categories?: YogaCategory[]): Yoga[] {
  const out: Yoga[] = [];
  for (const cat of categories ?? []) {
    for (const item of cat.yoga_list ?? []) {
      if (item.has_yoga && item.name) {
        // Prokerala doesn't rank yoga strength; "Moderate" is our own display default.
        out.push({ name: item.name, effect: item.description ?? cat.name ?? "", strength: "Moderate" });
      }
    }
  }
  return out;
}

/** Extract the running mahadasha and its active antardasha from the timeline. */
function extractDasha(periods: RawDasha[]): { mahadasha: DashaPeriodType; antardasha: DashaPeriodType } {
  const now = Date.now();
  const within = (p: RawDasha) => {
    const s = p.start ? Date.parse(p.start) : NaN;
    const e = p.end ? Date.parse(p.end) : NaN;
    return !Number.isNaN(s) && !Number.isNaN(e) && now >= s && now <= e;
  };
  const maha = periods.find(within) ?? periods[0];
  const antar = maha?.antardasha?.find(within) ?? maha?.antardasha?.[0];

  const toPeriod = (p?: RawDasha): DashaPeriodType => ({
    planet: p?.planet?.name ?? p?.name ?? "—",
    start: (p?.start ?? "").slice(0, 10),
    end: (p?.end ?? "").slice(0, 10),
  });

  return { mahadasha: toPeriod(maha), antardasha: toPeriod(antar) };
}
