/**
 * Kundali Matching (Ashtakoot Guna Milan) service.
 *
 * PRODUCTION: never compute this with an LLM. Send both birth details to the
 * Swiss-Ephemeris astrology API (Prokerala / VedicAstroAPI / AstrologyAPI.com)
 * which returns the authentic 36-point Guna Milan + Mangal Dosha analysis.
 * Replace `matchKundali()` below with that call; keep the same return shape so
 * the UI does not change.
 */

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

/** Deterministic hash so the same two people always yield the same result. */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const VERDICTS: [number, string][] = [
  [80, "Excellent match"],
  [65, "Very good match"],
  [50, "Acceptable match"],
  [0, "Needs remedial consultation"],
];

/**
 * MOCK compute. Deterministic from both people's details — swap for the API.
 */
export async function matchKundali(bride: MatchPerson, groom: MatchPerson): Promise<MatchResult> {
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
  const verdict = VERDICTS.find(([t]) => percent >= t)![1];

  const mangalCompatible = ((seed >> 24) & 1) === 1;
  const mangal: MangalCheck = mangalCompatible
    ? { compatible: true, summary: "Both charts are Manglik-compatible — no remedy required." }
    : {
        compatible: false,
        summary: "A Mangal Dosha mismatch is present. A Mangal Shanti puja is advised before fixing a date.",
      };

  const lowKoota = kootas.reduce((min, k) => (k.got / k.max < min.got / min.max ? k : min));
  const recommendation =
    percent >= 65
      ? `A strong union. ${lowKoota.got / lowKoota.max < 0.6 ? `${lowKoota.label} koota is on the lower side — a remedial puja at Ayodhya is recommended before finalising.` : "Auspicious to proceed with an astrologer-confirmed muhurat."}`
      : "Guna score is below the recommended threshold. Consult an Ayodhya-verified astrologer for a detailed reading and remedies.";

  return { totalGot, totalMax, percent, verdict, kootas, mangal, recommendation };
}
