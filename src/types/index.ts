/** Core domain types for Awadh Astro */

export interface BirthDetails {
  name: string;
  dateOfBirth: string; // YYYY-MM-DD
  timeOfBirth: string; // HH:mm
  placeOfBirth: string;
  gender: "male" | "female" | "other";
}

export interface PlanetPosition {
  planet: string;
  sign: string;
  house: number;
  degree: number;
  retrograde: boolean;
}

export interface KundaliResult {
  ascendant: string;
  moonSign: string; // rashi
  sunSign: string;
  nakshatra: string;
  currentDasha: string;
  planets: PlanetPosition[];
  dailyInsight: string;
}

export type AstrologerStatus = "online" | "busy" | "offline";

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
}

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  text: string;
  timestamp: number;
}

export interface PlusPlan {
  id: string;
  name: string;
  pricePerYear: number; // INR
  features: string[];
  highlighted: boolean;
}
