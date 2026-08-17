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
    /**
     * ₹300/year, down from ₹999. At ₹999 the plan asked more than the free
     * tier's gap justified; at ₹300 (₹25/month) it reads as an easy yes, and
     * the two puja-linked perks below give it standalone value even for
     * someone who only books one seva a year.
     */
    pricePerYear: 300,
    features: [
      "Everything in Free",
      "Free prasad shipping on every puja (anywhere in India)",
      "Free HD video recording of your puja",
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
