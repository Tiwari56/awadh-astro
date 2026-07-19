import type { PujaOffering } from "@/types";

/**
 * Mock catalog of ritual-by-proxy offerings — the strategic flagship product.
 * PRODUCTION: back this with the pandit/temple scheduling system; each offering
 * maps to a verified Ayodhya pandit, a temple slot, and a muhurat computed from
 * the devotee's chart. Prices are illustrative.
 */
export const PUJA_OFFERINGS: PujaOffering[] = [
  {
    id: "rudrabhishek",
    name: "Rudrabhishek",
    deity: "Lord Shiva",
    temple: "Nageshwarnath Temple, Ayodhya",
    purpose: "Removes obstacles, grants health, peace and prosperity.",
    forLifeEvents: ["Health", "New beginnings", "Peace of mind"],
    durationMins: 90,
    priceINR: 2100,
    liveVideo: true,
    prasadCourier: true,
    internationalShipping: true,
    popular: true,
  },
  {
    id: "navagraha-shanti",
    name: "Navagraha Shanti",
    deity: "The Nine Planets",
    temple: "Ram Ki Paidi, Ayodhya",
    purpose: "Pacifies afflicted planets — recommended during Sade Sati or a difficult dasha.",
    forLifeEvents: ["Sade Sati", "Dosha remedy", "Career blocks"],
    durationMins: 120,
    priceINR: 3100,
    liveVideo: true,
    prasadCourier: true,
    internationalShipping: true,
    popular: true,
  },
  {
    id: "mangal-dosha-nivaran",
    name: "Mangal Dosha Nivaran",
    deity: "Lord Hanuman & Mangal",
    temple: "Hanuman Garhi, Ayodhya",
    purpose: "Remedy for Manglik dosha before marriage; harmony in married life.",
    forLifeEvents: ["Before marriage", "Manglik remedy"],
    durationMins: 75,
    priceINR: 2500,
    liveVideo: true,
    prasadCourier: true,
    internationalShipping: true,
    popular: false,
  },
  {
    id: "naamkaran",
    name: "Naamkaran Sanskar",
    deity: "Family deity",
    temple: "Verified pandit, Ayodhya",
    purpose: "Traditional naming ceremony for a newborn, on an auspicious muhurat.",
    forLifeEvents: ["Newborn", "Naming ceremony"],
    durationMins: 60,
    priceINR: 1800,
    liveVideo: true,
    prasadCourier: true,
    internationalShipping: true,
    popular: false,
  },
  {
    id: "griha-pravesh",
    name: "Griha Pravesh Puja",
    deity: "Vastu & Lord Ganesha",
    temple: "Performed at your home / by proxy in Ayodhya",
    purpose: "Blessings and Vastu shanti for entering a new home.",
    forLifeEvents: ["New home", "Vastu"],
    durationMins: 90,
    priceINR: 2800,
    liveVideo: true,
    prasadCourier: true,
    internationalShipping: true,
    popular: false,
  },
  {
    id: "satyanarayan-katha",
    name: "Satyanarayan Katha",
    deity: "Lord Vishnu",
    temple: "Kanak Bhawan, Ayodhya",
    purpose: "Gratitude and blessings for business openings, anniversaries and vows fulfilled.",
    forLifeEvents: ["Business opening", "Anniversary", "Thanksgiving"],
    durationMins: 120,
    priceINR: 2400,
    liveVideo: true,
    prasadCourier: true,
    internationalShipping: true,
    popular: true,
  },
];

export function getPuja(id: string): PujaOffering | undefined {
  return PUJA_OFFERINGS.find((p) => p.id === id);
}
