import type { DashaPeriod, KundaliResult, Yoga } from "@/types";
import type { AstrologyProvider, BirthContext } from "../provider";

/**
 * Deterministic mock provider — output is a pure function of the birth details,
 * so the same person always gets the same (fake) chart. Used for local dev and
 * as the keyless fallback that keeps the free-kundali hook alive without secrets.
 *
 * It fills EVERY field of the enriched KundaliResult so the full UI can be built
 * and demoed with no API key. NOT astrologically valid — never present mock
 * output as a real reading in prod; gate it behind a non-prod check if needed.
 */

const SIGNS = [
  "Mesha (Aries)", "Vrishabha (Taurus)", "Mithuna (Gemini)", "Karka (Cancer)",
  "Simha (Leo)", "Kanya (Virgo)", "Tula (Libra)", "Vrishchika (Scorpio)",
  "Dhanu (Sagittarius)", "Makara (Capricorn)", "Kumbha (Aquarius)", "Meena (Pisces)",
];
const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
];
const PLANETS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
const DIGNITIES = ["Exalted", "Own Sign", "Friendly", "Neutral", "Enemy", "Debilitated"];
const TITHIS = [
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami",
  "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima",
];
const YOGAS_ALMANAC = [
  "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda",
  "Sukarma", "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva",
];
const KARANAS = ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti"];
const VARAS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const GEMS = ["Ruby", "Pearl", "Red Coral", "Emerald", "Yellow Sapphire", "Diamond", "Blue Sapphire", "Hessonite", "Cat's Eye"];
const COLORS = ["Saffron", "White", "Red", "Green", "Golden Yellow", "Sky Blue", "Deep Blue"];
const DIRECTIONS = ["East", "North-East", "North", "North-West", "West", "South-West", "South", "South-East"];

const YOGA_LIBRARY: Yoga[] = [
  { name: "Gaja-Kesari Yoga", effect: "Wisdom, respect, and lasting reputation.", strength: "Strong" },
  { name: "Budha-Aditya Yoga", effect: "Sharp intellect and success in communication.", strength: "Moderate" },
  { name: "Chandra-Mangala Yoga", effect: "Drive to earn; strong material ambition.", strength: "Moderate" },
  { name: "Dhana Yoga", effect: "Combinations supporting wealth accumulation.", strength: "Strong" },
  { name: "Raja Yoga", effect: "Authority, status, and leadership opportunities.", strength: "Strong" },
  { name: "Neecha-Bhanga Yoga", effect: "A weakness in the chart turns into strength.", strength: "Mild" },
];

export const mockProvider: AstrologyProvider = {
  name: "mock",
  async computeKundali(ctx: BirthContext): Promise<KundaliResult> {
    const { details } = ctx;
    const seed = hashString(details.name + details.dateOfBirth + details.timeOfBirth);
    const pick = <T,>(arr: T[], offset: number): T => arr[(seed + offset) % arr.length];
    const num = (offset: number, mod: number) => (seed * (offset + 1)) % mod;

    const birthYear = Number(details.dateOfBirth.slice(0, 4)) || 1990;
    const mahaStart = birthYear + (num(11, 30));
    const mahadasha: DashaPeriod = {
      planet: pick(PLANETS, 4),
      start: `${mahaStart}-01-01`,
      end: `${mahaStart + 6 + (num(12, 12))}-01-01`,
    };
    const antardasha: DashaPeriod = {
      planet: pick(PLANETS, 5),
      start: `${mahaStart + 1}-04-01`,
      end: `${mahaStart + 2}-08-01`,
    };

    const manglik = num(21, 5) === 0;
    const sadeSatiActive = num(22, 3) === 0;
    const kaalSarp = num(23, 6) === 0;

    // 2 deterministic yogas
    const yogas = [YOGA_LIBRARY[seed % YOGA_LIBRARY.length], YOGA_LIBRARY[(seed + 3) % YOGA_LIBRARY.length]];

    return {
      ascendant: pick(SIGNS, 0),
      moonSign: pick(SIGNS, 3),
      sunSign: pick(SIGNS, 7),
      nakshatra: pick(NAKSHATRAS, 2),
      currentDasha: `${mahadasha.planet} Mahadasha`,
      planets: PLANETS.map((planet, i) => ({
        planet,
        sign: pick(SIGNS, i * 2),
        house: ((seed + i * 3) % 12) + 1,
        degree: Math.round((((seed * (i + 1)) % 3000) / 100) * 10) / 10,
        retrograde: (seed + i) % 5 === 0,
        nakshatra: NAKSHATRAS[(seed + i * 5) % NAKSHATRAS.length],
        pada: ((seed + i) % 4) + 1,
        dignity: DIGNITIES[(seed + i * 2) % DIGNITIES.length],
      })),
      dailyInsight:
        "Today favours steady effort over bold moves. A conversation with an elder brings clarity. Avoid major purchases after sunset.",

      panchang: {
        tithi: pick(TITHIS, 1),
        vara: pick(VARAS, 6),
        nakshatra: pick(NAKSHATRAS, 2),
        yoga: pick(YOGAS_ALMANAC, 8),
        karana: pick(KARANAS, 4),
        moonPhase: seed % 2 === 0 ? "Shukla Paksha (waxing)" : "Krishna Paksha (waning)",
      },
      mahadasha,
      antardasha,
      mangalDosha: {
        present: manglik,
        severity: manglik ? (num(24, 2) === 0 ? "High" : "Moderate") : "None",
        summary: manglik
          ? "Mars is placed in a Manglik house. Traditionally advised to match with a Manglik partner or perform remedies before marriage."
          : "No Mangal Dosha detected. Mars is not in a Manglik position.",
      },
      sadeSati: {
        present: sadeSatiActive,
        severity: sadeSatiActive ? "Moderate" : "None",
        summary: sadeSatiActive
          ? "Saturn is currently transiting the 12th/1st/2nd from your Moon — the Sade Sati phase. A period for patience, discipline and remedies."
          : "You are not currently in Sade Sati. Saturn is not transiting near your Moon sign.",
      },
      kaalSarpDosha: {
        present: kaalSarp,
        severity: kaalSarp ? "Low" : "None",
        summary: kaalSarp
          ? "All planets fall between Rahu and Ketu, forming a partial Kaal Sarp Yoga. Effects vary by house."
          : "No Kaal Sarp Dosha. Planets are not hemmed between Rahu and Ketu.",
      },
      yogas,
      luckyGem: pick(GEMS, 4),
      luckyNumber: (seed % 9) + 1,
      luckyColor: pick(COLORS, 3),
      favorableDirection: pick(DIRECTIONS, 2),
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
