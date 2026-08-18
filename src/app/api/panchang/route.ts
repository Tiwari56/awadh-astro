import { NextRequest, NextResponse } from "next/server";
import { prokeralaGetSafe, coordsParam } from "@/lib/astrology/providers/prokerala-client";
import { isProkeralaConfigured, astrologyConfig } from "@/lib/astrology/config";
import { geocodePlace } from "@/lib/astrology/geocode";

/**
 * Daily Panchang for a given date + place. Powers the Panchang calendar.
 *
 * Falls back to a deterministic mock when Prokerala isn't configured, so the
 * calendar stays usable in local dev — mirroring how the kundali seam works.
 */

interface PanchangEntry { name?: string; paksha?: string; start?: string; end?: string; }
interface PanchangData {
  vaara?: string;
  tithi?: PanchangEntry[];
  nakshatra?: PanchangEntry[];
  karana?: PanchangEntry[];
  yoga?: PanchangEntry[];
  sunrise?: string;
  sunset?: string;
  moonrise?: string;
  moonset?: string;
}

const TITHIS = [
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami",
  "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima",
];
const NAKS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya",
  "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati",
  "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana",
  "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
];
const YOGAS = [
  "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti",
  "Shula", "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata",
  "Variyana", "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti",
];
const KARANAS = ["Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti"];
const VARAS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Deterministic per-date mock so the same day always renders the same values. */
function mockPanchang(date: string) {
  const d = new Date(`${date}T06:00:00Z`);
  const dayNum = Math.floor(d.getTime() / 86_400_000);
  const tithiIdx = dayNum % 30;
  return {
    date,
    vara: VARAS[d.getUTCDay()],
    tithi: TITHIS[tithiIdx % 15],
    paksha: tithiIdx < 15 ? "Shukla Paksha" : "Krishna Paksha",
    nakshatra: NAKS[dayNum % 27],
    yoga: YOGAS[dayNum % 27],
    karana: KARANAS[dayNum % 7],
    sunrise: "06:12",
    sunset: "18:24",
    source: "mock" as const,
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const place = searchParams.get("place") || "Ayodhya, Uttar Pradesh, India";

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "date=YYYY-MM-DD is required" }, { status: 400 });
  }

  if (!isProkeralaConfigured()) {
    return NextResponse.json(mockPanchang(date));
  }

  const loc = (await geocodePlace(place)) ?? { latitude: 26.7922, longitude: 82.1998, utcOffsetSeconds: 19800 };
  const offsetHours = Math.trunc(loc.utcOffsetSeconds / 3600);
  const offsetMins = Math.abs(Math.trunc((loc.utcOffsetSeconds % 3600) / 60));
  const sign = loc.utcOffsetSeconds >= 0 ? "+" : "-";
  const tz = `${sign}${String(Math.abs(offsetHours)).padStart(2, "0")}:${String(offsetMins).padStart(2, "0")}`;

  const data = await prokeralaGetSafe<PanchangData>("/v2/astrology/panchang", {
    ayanamsa: String(astrologyConfig.ayanamsa),
    coordinates: coordsParam(loc.latitude, loc.longitude),
    datetime: `${date}T06:00:00${tz}`,
  });

  if (!data) return NextResponse.json(mockPanchang(date));

  return NextResponse.json({
    date,
    vara: data.vaara ?? "—",
    tithi: data.tithi?.[0]?.name ?? "—",
    paksha: data.tithi?.[0]?.paksha ?? "—",
    nakshatra: data.nakshatra?.[0]?.name ?? "—",
    yoga: data.yoga?.[0]?.name ?? "—",
    karana: data.karana?.[0]?.name ?? "—",
    sunrise: data.sunrise ? data.sunrise.slice(11, 16) : "—",
    sunset: data.sunset ? data.sunset.slice(11, 16) : "—",
    source: "prokerala" as const,
  });
}
