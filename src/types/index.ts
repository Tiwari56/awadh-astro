/** Core domain types for Awadh Astro */

export interface BirthDetails {
  name: string;
  dateOfBirth: string; // YYYY-MM-DD
  timeOfBirth: string; // HH:mm
  placeOfBirth: string;
  gender: "male" | "female" | "other";
  /**
   * True when the user doesn't know their exact birth time. We fall back to
   * 12:00 noon (a standard astrological convention for unknown-time charts)
   * and the UI must disclose that Ascendant/houses are then approximate —
   * Moon/Sun sign and nakshatra are still accurate since those don't shift
   * within a single day. No astrology API we use has a dedicated
   * "time unknown" parameter, so this is handled entirely on our side.
   */
  timeUnknown?: boolean;
}

export interface PlanetPosition {
  planet: string;
  sign: string;
  house: number;
  degree: number;
  retrograde: boolean;
  nakshatra: string;
  pada: number; // nakshatra quarter, 1–4
  dignity: string; // Exalted / Debilitated / Own Sign / Friendly / Neutral / Enemy
}

/** Vedic almanac for the moment of birth. */
export interface Panchang {
  tithi: string; // lunar day
  vara: string; // weekday
  nakshatra: string; // birth star
  yoga: string;
  karana: string;
  moonPhase: string;
}

/** A Vimshottari dasha period (mahadasha or the running antardasha). */
export interface DashaPeriod {
  planet: string;
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
}

/** Presence/severity summary for a classical dosha or transit. */
export interface DoshaSummary {
  present: boolean;
  severity: "None" | "Low" | "Moderate" | "High";
  summary: string;
}

/** A notable yoga (planetary combination) found in the chart. */
export interface Yoga {
  name: string;
  effect: string;
  strength: "Strong" | "Moderate" | "Mild";
}

export interface KundaliResult {
  ascendant: string;
  moonSign: string; // rashi
  sunSign: string;
  nakshatra: string;
  currentDasha: string;
  planets: PlanetPosition[];
  dailyInsight: string;

  // --- Enriched detail ---
  panchang: Panchang;
  mahadasha: DashaPeriod;
  antardasha: DashaPeriod;
  mangalDosha: DoshaSummary; // "Manglik" status
  sadeSati: DoshaSummary; // Saturn's 7.5-year cycle over the Moon
  kaalSarpDosha: DoshaSummary;
  yogas: Yoga[];
  luckyGem: string;
  luckyNumber: number;
  luckyColor: string;
  favorableDirection: string;
}

export type AstrologerStatus = "online" | "busy" | "offline";

/** How a devotee can consult this astrologer — distinct from live presence (`status`). */
export type ConsultMode = "online" | "in-person";

export interface Astrologer {
  id: string;
  name: string;
  photoInitials: string;
  specialties: string[];
  languages: string[];
  experienceYears: number;
  ratePerMin: number; // INR
  rating: number; // 0–5
  totalConsults: number;
  status: AstrologerStatus;
  ayodhyaVerified: boolean;
  consultModes: ConsultMode[]; // e.g. ["online"] or ["online", "in-person"]
  officeLocation?: string; // set when "in-person" is offered
}

/** A structured "subscribe to see the benefit" card, rendered in place of a plain text bubble. */
export interface ChatUpsellPayload {
  headline: string;
  benefits: string[];
  ctaLabel: string;
  ctaHref: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  text: string;
  timestamp: number;
  kind?: "text" | "upsell"; // default "text" when absent
  upsell?: ChatUpsellPayload;
}

export interface PlusPlan {
  id: string;
  name: string;
  pricePerYear: number; // INR
  features: string[];
  highlighted: boolean;
}

/**
 * The strategic flagship: a puja/ritual performed by proxy by a verified Ayodhya
 * pandit in a real Ayodhya temple, streamed live, with prasad couriered to the
 * devotee (including internationally, for the diaspora audience).
 */
export interface PujaOffering {
  id: string;
  name: string; // e.g. "Rudrabhishek"
  deity: string; // e.g. "Lord Shiva"
  temple: string; // Ayodhya temple where it is performed
  purpose: string; // what devotees seek from it
  forLifeEvents: string[]; // milestones this serves (marriage, birth, business…)
  durationMins: number;
  priceINR: number;
  liveVideo: boolean;
  prasadCourier: boolean;
  internationalShipping: boolean;
  popular: boolean;
}

export interface PujaBooking {
  offeringId: string;
  devoteeName: string;
  gotra: string;
  sankalp: string; // the intention/wish offered with the puja
  preferredDate: string; // YYYY-MM-DD (a muhurat is confirmed later)
  shippingCountry: string;
  shippingAddress: string;
  wantsLiveVideo: boolean;
}
