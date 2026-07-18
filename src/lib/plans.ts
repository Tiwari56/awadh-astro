import type { PlusPlan } from "@/types";

export const PLUS_PLANS: PlusPlan[] = [
  {
    id: "free",
    name: "Free",
    pricePerYear: 0,
    features: [
      "Instant kundali from birth details",
      "Daily horoscope",
      "Browse astrologers & pay per minute",
      "5 AI chat messages/day",
    ],
    highlighted: false,
  },
  {
    id: "plus",
    name: "Awadh Plus",
    pricePerYear: 999,
    features: [
      "Everything in Free",
      "Personalized muhurat alerts (good days to buy, invest, travel)",
      "Caution-day warnings from your kundali (what to avoid)",
      "Rahu Kaal & Sade Sati notifications",
      "Monthly detailed kundali report (PDF)",
      "Unlimited AI astro chat",
      "10% off all live consultations",
    ],
    highlighted: true,
  },
];
