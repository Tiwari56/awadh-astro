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

/** Optional add-ons a devotee can attach to any puja booking, priced live in the cart. */
export interface PujaAddon {
  id: string;
  label: string;
  description: string;
  priceINR: number;
  requiresServiceableCity?: boolean; // physical delivery/attendance, not just courier
}

export const PUJA_ADDONS: PujaAddon[] = [
  { id: "extra-prasad", label: "Extra Prasad Box", description: "A second prasad box shipped to another address", priceINR: 350 },
  { id: "bhandara", label: "Bhandara / Prasad Donation", description: "Sponsor a meal distribution at an NGO or old-age home in your family's name", priceINR: 501, requiresServiceableCity: true },
  { id: "hd-recording", label: "HD Recording + Photo Album", description: "Professionally edited video and photo album, delivered digitally", priceINR: 299 },
  { id: "extra-sankalp", label: "Add a Second Sankalp", description: "Include another family member's name & gotra in the same ritual", priceINR: 199 },
];

/**
 * Cities where in-person bhandara/NGO delivery is currently serviceable.
 * PRODUCTION: replace with a real pincode-lookup service; prasad courier
 * itself ships everywhere (see PujaOffering.internationalShipping) — this
 * list only gates the *in-person* bhandara/old-age-home add-on.
 */
export const SERVICEABLE_CITIES = [
  "Ayodhya", "Lucknow", "Delhi", "Mumbai", "Bengaluru", "Kolkata",
  "Hyderabad", "Pune", "Chennai", "Ahmedabad", "Varanasi", "Prayagraj",
];

export function isCityServiceable(city: string): boolean {
  const q = city.trim().toLowerCase();
  if (!q) return false;
  return SERVICEABLE_CITIES.some((c) => q.includes(c.toLowerCase()));
}
