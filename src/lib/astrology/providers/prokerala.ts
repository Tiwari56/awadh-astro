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
 * Verified against a real live response (Aug 2026, production credentials,
 * not sandbox): `/kundli/advanced` nests nakshatra/chandra_rasi/soorya_rasi/
 * additional_info under a `nakshatra_details` wrapper (an earlier draft of
 * this file assumed they were top-level — fixed). `additional_info`'s
 * direction field is `best_direction`, not `direction`. `/planet-position`
 * returns `id/name/longitude/is_retrograde/position/degree/rasi` per planet
 * INCLUDING an "Ascendant" entry — but genuinely never returns a per-planet
 * `nakshatra` or `avastha` (dignity) field at this endpoint/plan tier, so
 * those two columns in the planet table correctly show "—" rather than
 * guessed/wrong data.
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
  /**
   * NOT the house number — live responses show this is always `rasi.id + 1`,
   * i.e. the 1-based sign number. Houses are computed from the ascendant via
   * houseFromAscendant(). Kept here only to document the trap.
   */
  position?: number;
  /** Sidereal longitude 0–360°, across the whole zodiac. Nakshatra derives from this. */
  longitude?: number;
  /** Degrees within the current sign (0–30). */
  degree?: number;
  rasi?: Rasi;
  // nakshatra/avastha are NOT present on real /planet-position responses
  // (confirmed live) — nakshatra is derived from `longitude` instead;
  // dignity has no source yet and honestly shows "—".
  nakshatra?: NakshatraInfo;
  avastha?: string;
}
interface PlanetPositionData { planet_position?: PlanetEntry[]; }

interface AdditionalInfo {
  deity?: string; ganam?: string; symbol?: string; animal_sign?: string; nadi?: string;
  color?: string; best_direction?: string; syllables?: string; birth_stone?: string;
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

interface NakshatraDetails {
  nakshatra?: NakshatraInfo;
  chandra_rasi?: Rasi;
  soorya_rasi?: Rasi;
  additional_info?: AdditionalInfo;
}

/**
 * `/v2/astrology/kundli/advanced` — the one big call covering birth details,
 * mangal dosha, yogas, and dasha. Confirmed against a live response (Aug
 * 2026, real credentials): nakshatra/chandra_rasi/soorya_rasi/additional_info
 * are nested under `nakshatra_details`, not top-level as an earlier draft of
 * this file assumed.
 */
interface KundliAdvancedData {
  nakshatra_details?: NakshatraDetails;
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

/**
 * Sidereal signs in zodiac order. Prokerala's `rasi.id` is ZERO-BASED
 * (id 0 = Mesha … id 11 = Meena) — verified against live responses where
 * e.g. {id: 11, name: "Meena"} and {id: 0, name: "Mesha"}. An earlier
 * one-based mapping here shifted EVERY sign by one, so ascendant, moon sign,
 * sun sign and every planet's rasi were silently wrong on every chart.
 */
const SIGNS = [
  "Mesha (Aries)", "Vrishabha (Taurus)", "Mithuna (Gemini)",
  "Karka (Cancer)", "Simha (Leo)", "Kanya (Virgo)",
  "Tula (Libra)", "Vrishchika (Scorpio)", "Dhanu (Sagittarius)",
  "Makara (Capricorn)", "Kumbha (Aquarius)", "Meena (Pisces)",
];

/** Sanskrit rasi name (as Prokerala returns it) -> our canonical "Sanskrit (English)" label. */
const SIGN_BY_NAME: Record<string, string> = Object.fromEntries(
  SIGNS.map((label) => [label.split(" (")[0].toLowerCase(), label])
);

/** Zero-based sidereal sign index (0 = Mesha), or null if unknown. */
function rasiIndex(rasi?: Rasi): number | null {
  if (typeof rasi?.id === "number" && rasi.id >= 0 && rasi.id < 12) return rasi.id;
  if (rasi?.name) {
    const i = SIGNS.findIndex((s) => s.split(" (")[0].toLowerCase() === rasi.name!.toLowerCase());
    if (i >= 0) return i;
  }
  return null;
}

function formatRasi(rasi?: Rasi): string {
  // Prefer the API's own name (unambiguous) and normalise it to our label
  // format; fall back to the zero-based id.
  if (rasi?.name && SIGN_BY_NAME[rasi.name.toLowerCase()]) return SIGN_BY_NAME[rasi.name.toLowerCase()];
  const i = rasiIndex(rasi);
  return i === null ? "—" : SIGNS[i];
}

/**
 * The 27 nakshatras in order. Each spans 360/27 = 13°20' of the sidereal
 * zodiac, and each divides into 4 padas of 3°20'.
 */
const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta",
  "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
];
const NAKSHATRA_SPAN = 360 / 27;

/**
 * Nakshatra + pada from sidereal longitude. Prokerala's /planet-position
 * doesn't return per-planet nakshatra, but it DOES return each planet's
 * sidereal longitude — and nakshatra is a pure deterministic function of
 * that, so we derive it rather than showing "—". Verified against the
 * API's own independently-computed Moon nakshatra + pada on multiple charts.
 */
function nakshatraFromLongitude(longitude?: number): { name: string; pada: number } {
  if (typeof longitude !== "number" || Number.isNaN(longitude)) return { name: "—", pada: 0 };
  const lon = ((longitude % 360) + 360) % 360;
  const index = Math.floor(lon / NAKSHATRA_SPAN);
  const pada = Math.floor((lon % NAKSHATRA_SPAN) / (NAKSHATRA_SPAN / 4)) + 1;
  return { name: NAKSHATRAS[index] ?? "—", pada };
}

/**
 * House number (1–12) counted from the ascendant's sign — the standard
 * whole-sign house system used in North Indian charts.
 *
 * Prokerala's `position` field is NOT the house: live responses show it is
 * always `rasi.id + 1`, i.e. the 1-based SIGN number. Using it as the house
 * (as this file previously did) put every planet in the wrong house unless
 * the ascendant happened to be Mesha, which is also why the rendered birth
 * chart looked wrong.
 */
function houseFromAscendant(planetSign: number | null, ascSign: number | null): number {
  if (planetSign === null || ascSign === null) return 0;
  return ((planetSign - ascSign + 12) % 12) + 1;
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
  return {
    coordinates: coordsParam(ctx.location.latitude, ctx.location.longitude),
    datetime: ctx.datetime,
    // Prokerala accepts a `language` param on every endpoint (credits cost
    // more for non-English per their pricing page). "hi" is the standard
    // ISO 639-1 code — worth a quick live-response check the first time
    // real credentials are used, in case Prokerala expects a different code.
    language: ctx.locale === "hi" ? "hi" : "en",
  };
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
    // Prokerala returns the ascendant as a planet_position entry named
    // "Ascendant" (confirmed live). It anchors the whole-sign house system,
    // and is also shown in the positions table as Lagna — it's the single
    // most important row in a Vedic chart, so it must not be filtered out.
    const ascendantEntry = planetEntries.find((e) => e.name?.toLowerCase() === "ascendant");
    const ascSign = rasiIndex(ascendantEntry?.rasi);

    const toPosition = (e: PlanetEntry, label?: string): PlanetPosition => {
      const nak = nakshatraFromLongitude(e.longitude);
      return {
        planet: label ?? e.name!,
        sign: formatRasi(e.rasi),
        house: houseFromAscendant(rasiIndex(e.rasi), ascSign),
        degree: typeof e.degree === "number" ? Math.round(e.degree * 10) / 10 : 0,
        retrograde: Boolean(e.is_retrograde),
        nakshatra: nak.name,
        pada: nak.pada,
        dignity: e.avastha ?? "—",
      };
    };

    // Lagna first (house 1 by definition), then the grahas in classical order.
    const planets: PlanetPosition[] = [
      ...(ascendantEntry ? [toPosition(ascendantEntry, "Ascendant")] : []),
      ...planetEntries
        .filter((e) => e.name && e.name.toLowerCase() !== "ascendant")
        .map((e) => toPosition(e)),
    ];

    const { mahadasha, antardasha } = extractDasha(kundli.dasha_periods ?? []);
    const nakDetails = kundli.nakshatra_details;
    const info = nakDetails?.additional_info;

    return {
      ascendant: formatRasi(ascendantEntry?.rasi),
      moonSign: formatRasi(nakDetails?.chandra_rasi),
      sunSign: formatRasi(nakDetails?.soorya_rasi),
      nakshatra: nakDetails?.nakshatra?.name ?? "—",
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
        nakshatra: panchang?.nakshatra?.[0]?.name ?? nakDetails?.nakshatra?.name ?? "—",
        yoga: panchang?.yoga?.[0]?.name ?? "—",
        karana: panchang?.karana?.[0]?.name ?? "—",
        moonPhase: panchang?.tithi?.[0]?.paksha ?? "—",
      },
      mahadasha,
      antardasha,
      mangalDosha: formatMangalDosha(kundli.mangal_dosha),
      sadeSati: computeSadeSati(nakDetails?.chandra_rasi, currentSaturn?.planet_position),
      kaalSarpDosha: formatKaalSarp(kaalSarp),
      yogas: extractYogas(kundli.yoga_details),
      luckyGem: info?.birth_stone ?? "—",
      luckyNumber: lifePathNumber(ctx.details.dateOfBirth),
      luckyColor: info?.color ?? "—",
      favorableDirection: info?.best_direction ?? "—",
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
function computeSadeSati(moonRasi: Rasi | undefined, saturnNow?: PlanetEntry[]): DoshaSummary {
  const saturn = saturnNow?.find((e) => e.name?.toLowerCase() === "saturn");
  // Sign indices are ZERO-based, so a plain truthiness check would treat
  // Mesha (0) as "missing" and silently skip Sade Sati for everyone born
  // with Moon or Saturn in Aries. Compare against null explicitly.
  const moonIdx = rasiIndex(moonRasi);
  const saturnIdx = rasiIndex(saturn?.rasi);
  if (moonIdx === null || saturnIdx === null) {
    return { present: false, severity: "None", summary: "Sade Sati status could not be computed (transit data unavailable)." };
  }
  const houseFromMoon = ((saturnIdx - moonIdx + 12) % 12) + 1; // 1..12, Moon's own sign = 1
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
