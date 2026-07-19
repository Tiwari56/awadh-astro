import type { Astrologer } from "@/types";

/**
 * Astrologer directory service.
 * PRODUCTION: fetch from backend (PostgreSQL) with live status from Redis presence.
 */
export const MOCK_ASTROLOGERS: Astrologer[] = [
  {
    id: "a1", name: "Pt. Ramesh Shastri", photoInitials: "RS",
    specialties: ["Vedic", "Kundali Milan", "Muhurat"], languages: ["Hindi", "Awadhi"],
    experienceYears: 22, ratePerMin: 35, rating: 4.9, totalConsults: 4120,
    status: "online", ayodhyaVerified: true,
  },
  {
    id: "a2", name: "Acharya Vinod Tiwari", photoInitials: "VT",
    specialties: ["Vastu", "Career", "Vedic"], languages: ["Hindi", "English"],
    experienceYears: 15, ratePerMin: 25, rating: 4.7, totalConsults: 2890,
    status: "online", ayodhyaVerified: true,
  },
  {
    id: "a3", name: "Dr. Meena Upadhyay", photoInitials: "MU",
    specialties: ["Marriage", "Numerology"], languages: ["Hindi", "English"],
    experienceYears: 12, ratePerMin: 30, rating: 4.8, totalConsults: 3350,
    status: "busy", ayodhyaVerified: true,
  },
  {
    id: "a4", name: "Pt. Suresh Mishra", photoInitials: "SM",
    specialties: ["Kundali", "Remedies", "Gemstones"], languages: ["Hindi"],
    experienceYears: 30, ratePerMin: 50, rating: 4.9, totalConsults: 6740,
    status: "online", ayodhyaVerified: true,
  },
  {
    id: "a5", name: "Jyotishi Kavita Dubey", photoInitials: "KD",
    specialties: ["Tarot", "Love & Relationships"], languages: ["Hindi", "English"],
    experienceYears: 8, ratePerMin: 20, rating: 4.6, totalConsults: 1560,
    status: "offline", ayodhyaVerified: false,
  },
  {
    id: "a6", name: "Acharya Devendra Pandey", photoInitials: "DP",
    specialties: ["Vedic", "Health", "Sade Sati"], languages: ["Hindi", "Sanskrit"],
    experienceYears: 25, ratePerMin: 40, rating: 4.8, totalConsults: 5210,
    status: "online", ayodhyaVerified: true,
  },
];

export async function getAstrologers(): Promise<Astrologer[]> {
  // PRODUCTION: GET /api/astrologers
  return MOCK_ASTROLOGERS;
}
