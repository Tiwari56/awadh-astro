/**
 * Kundali Matching (Ashtakoot Guna Milan) service.
 *
 * Dispatches to Prokerala's real matching endpoint when configured (same
 * ASTROLOGY_PROVIDER=prokerala + PROKERALA_CLIENT_ID/SECRET as the kundali
 * seam — see ./config.ts), falling back to the deterministic mock otherwise.
 * Never computes this with an LLM.
 *
 * Real endpoint verified against Prokerala's OpenAPI spec (Aug 2026):
 *   GET https://api.prokerala.com/v2/astrology/kundli-matching/advanced
 *   params: ayanamsa, girl_coordinates, girl_dob, boy_coordinates, boy_dob, language
 *   ("_dob" is a full ISO 8601 datetime with UTC offset, not just a date.)
 * https://api.prokerala.com/spec/astrology.v2.yaml
 */

import { isProkeralaConfigured } from "./config";
import { resolveBirthLocation } from "./geocode";
import { coordsParam, prokeralaGet } from "./providers/prokerala-client";

export interface MatchPerson {
  name: string;
  dateOfBirth: string; // YYYY-MM-DD
  timeOfBirth: string; // HH:mm
  placeOfBirth: string;
}

export interface Koota {
  key: string;
  label: string; // English
  hindi: string; // Devanagari
  got: number;
  max: number;
  note: string;
}

export interface MangalCheck {
  compatible: boolean;
  summary: string;
}

export interface MatchResult {
  totalGot: number; // out of 36
  totalMax: number; // 36
  percent: number; // 0–100
  verdict: string; // e.g. "Excellent match"
  kootas: Koota[];
  mangal: MangalCheck;
  recommendation: string;
}

// The 8 kootas and their classical maximum points (sum = 36).
const KOOTA_DEFS: Omit<Koota, "got" | "note">[] = [
  { key: "varna", label: "Varna", hindi: "वर्ण", max: 1 },
  { key: "vashya", label: "Vashya", hindi: "वश्य", max: 2 },
  { key: "tara", label: "Tara", hindi: "तारा", max: 3 },
  { key: "yoni", label: "Yoni", hindi: "योनि", max: 4 },
  { key: "maitri", label: "Graha Maitri", hindi: "ग्रह मैत्री", max: 5 },
  { key: "gana", label: "Gana", hindi: "गण", max: 6 },
  { key: "bhakoot", label: "Bhakoot", hindi: "भकूट", max: 7 },
  { key: "nadi", label: "Nadi", hindi: "नाड़ी", max: 8 },
];

const KOOTA_NOTES: Record<string, string> = {
  varna: "Spiritual & ego compatibility.",
  vashya: "Mutual attraction and control.",
  tara: "Health & destiny compatibility.",
  yoni: "Physical & intimate compatibility.",
  maitri: "Mental & intellectual bonding.",
  gana: "Temperament & behaviour.",
  bhakoot: "Love, finances & family welfare.",
  nadi: "Health of progeny & genes.",
};

const VERDICTS: [number, string][] = [
  [80, "Excellent match"],
  [65, "Very good match"],
  [50, "Acceptable match"],
  [0, "Needs remedial consultation"],
];

function verdictFor(percent: number): string {
  return VERDICTS.find(([t]) => percent >= t)![1];
}

function recommendationFor(percent: number, kootas: Koota[]): string {
  const lowKoota = kootas.reduce((min, k) => (k.got / k.max < min.got / min.max ? k : min));
  return percent >= 65
    ? `A strong union. ${lowKoota.got / lowKoota.max < 0.6 ? `${lowKoota.label} koota is on the lower side — a remedial puja at Ayodhya is recommended before finalising.` : "Auspicious to proceed with an astrologer-confirmed muhurat."}`
    : "Guna score is below the recommended threshold. Consult an Ayodhya-verified astrologer for a detailed reading and remedies.";
}

// --- Public entry point ---------------------------------------------------------

export async function matchKundali(bride: MatchPerson, groom: MatchPerson): Promise<MatchResult> {
  if (!isProkeralaConfigured()) return mockMatchKundali(bride, groom);
  try {
    return await prokeralaMatchKundali(bride, groom);
  } catch (err) {
    console.error("[matching] Prokerala provider failed, falling back to mock:", err);
    return mockMatchKundali(bride, groom);
  }
}

// --- Real provider ----------------------------------------------------------------

interface GunaEntry { id?: string; name?: string; obtained_points?: number; maximum_points?: number; description?: string; }
interface MangalDoshaDetails { has_dosha?: boolean; dosha_type?: string; description?: string; }
interface KundliMatchingData {
  guna_milan?: { total_points?: number; maximum_points?: number; guna?: GunaEntry[] };
  girl_mangal_dosha_details?: MangalDoshaDetails;
  boy_mangal_dosha_details?: MangalDoshaDetails;
  message?: { type?: string; description?: string };
}

/** Fuzzy-maps Prokerala's koota name (e.g. "Graha Maitri Koot") to our internal key. */
function matchKootaKey(name: string): string | null {
  const n = name.toLowerCase();
  if (n.includes("varna")) return "varna";
  if (n.includes("vasya") || n.includes("vashya")) return "vashya";
  if (n.includes("tara")) return "tara";
  if (n.includes("yoni")) return "yoni";
  if (n.includes("maitri")) return "maitri";
  if (n.includes("gana")) return "gana";
  if (n.includes("bhakoot") || n.includes("bhkoot")) return "bhakoot";
  if (n.includes("nadi")) return "nadi";
  return null;
}

async function prokeralaMatchKundali(bride: MatchPerson, groom: MatchPerson): Promise<MatchResult> {
  const [girl, boy] = await Promise.all([
    resolveBirthLocation(bride.placeOfBirth, bride.dateOfBirth, bride.timeOfBirth),
    resolveBirthLocation(groom.placeOfBirth, groom.dateOfBirth, groom.timeOfBirth),
  ]);

  const data = await prokeralaGet<KundliMatchingData>("/v2/astrology/kundli-matching/advanced", {
    girl_coordinates: coordsParam(girl.location.latitude, girl.location.longitude),
    girl_dob: girl.datetime,
    boy_coordinates: coordsParam(boy.location.latitude, boy.location.longitude),
    boy_dob: boy.datetime,
    language: "en",
  });

  const gunaByKey = new Map<string, GunaEntry>();
  for (const g of data.guna_milan?.guna ?? []) {
    const key = g.name ? matchKootaKey(g.name) : null;
    if (key) gunaByKey.set(key, g);
  }

  const kootas: Koota[] = KOOTA_DEFS.map((def) => {
    const g = gunaByKey.get(def.key);
    return {
      ...def,
      got: g?.obtained_points ?? 0,
      max: g?.maximum_points ?? def.max,
      note: g?.description || KOOTA_NOTES[def.key],
    };
  });

  const totalMax = data.guna_milan?.maximum_points ?? 36;
  const totalGot = data.guna_milan?.total_points ?? kootas.reduce((s, k) => s + k.got, 0);
  const percent = Math.round((totalGot / totalMax) * 100);
  const verdict = data.message?.type || verdictFor(percent);

  const girlManglik = Boolean(data.girl_mangal_dosha_details?.has_dosha);
  const boyManglik = Boolean(data.boy_mangal_dosha_details?.has_dosha);
  const mangalCompatible = girlManglik === boyManglik; // traditional rule: both or neither
  const mangal: MangalCheck = mangalCompatible
    ? { compatible: true, summary: girlManglik ? "Both partners are Manglik — the doshas cancel each other out." : "Neither partner is Manglik — no remedy required." }
    : {
        compatible: false,
        summary: `${girlManglik ? "The bride" : "The groom"} is Manglik and the other is not. A Mangal Shanti puja is advised before fixing a date.`,
      };

  return {
    totalGot,
    totalMax,
    percent,
    verdict,
    kootas,
    mangal,
    recommendation: data.message?.description || recommendationFor(percent, kootas),
  };
}

// --- Mock provider (keyless fallback) ----------------------------------------------

/** Deterministic hash so the same two people always yield the same result. */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

async function mockMatchKundali(bride: MatchPerson, groom: MatchPerson): Promise<MatchResult> {
  const seed = hash(
    `${bride.name}|${bride.dateOfBirth}|${bride.timeOfBirth}|${groom.name}|${groom.dateOfBirth}|${groom.timeOfBirth}`,
  );

  const kootas: Koota[] = KOOTA_DEFS.map((k, i) => {
    // spread the seed across kootas; bias toward higher scores for a pleasant demo
    const r = (seed >> (i * 3)) & 0xff;
    let got = Math.round((r / 255) * k.max);
    if (got === 0 && k.max > 1) got = 1; // avoid all-zero rows in the mock
    return { ...k, got, note: KOOTA_NOTES[k.key] };
  });

  const totalGot = kootas.reduce((s, k) => s + k.got, 0);
  const totalMax = 36;
  const percent = Math.round((totalGot / totalMax) * 100);
  const verdict = verdictFor(percent);

  const mangalCompatible = ((seed >> 24) & 1) === 1;
  const mangal: MangalCheck = mangalCompatible
    ? { compatible: true, summary: "Both charts are Manglik-compatible — no remedy required." }
    : {
        compatible: false,
        summary: "A Mangal Dosha mismatch is present. A Mangal Shanti puja is advised before fixing a date.",
      };

  return { totalGot, totalMax, percent, verdict, kootas, mangal, recommendation: recommendationFor(percent, kootas) };
}
