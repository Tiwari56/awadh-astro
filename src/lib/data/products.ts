export interface SpiritualProduct {
  id: string;
  name: string;
  category: "gemstone" | "rudraksh" | "yantra" | "other";
  benefit: string;
  priceINR: number;
  image: string; // emoji placeholder — real product photography comes with the full e-commerce build
}

/**
 * Dummy catalog for the /shop teaser page (item 5 of the platform brief:
 * "just provide options for dummy data for now, we will have entire
 * e-commerce section for this later"). Not wired to cart/checkout/payments.
 */
export const SPIRITUAL_PRODUCTS: SpiritualProduct[] = [
  { id: "yellow-sapphire", name: "Yellow Sapphire (Pukhraj)", category: "gemstone", benefit: "Strengthens Jupiter — wisdom, wealth, marriage", priceINR: 8500, image: "💛" },
  { id: "blue-sapphire", name: "Blue Sapphire (Neelam)", category: "gemstone", benefit: "Strengthens Saturn — discipline, career growth", priceINR: 12000, image: "💙" },
  { id: "red-coral", name: "Red Coral (Moonga)", category: "gemstone", benefit: "Strengthens Mars — courage, vitality", priceINR: 4500, image: "❤️" },
  { id: "emerald", name: "Emerald (Panna)", category: "gemstone", benefit: "Strengthens Mercury — intellect, communication", priceINR: 9000, image: "💚" },
  { id: "5-mukhi-rudraksh", name: "5 Mukhi Rudraksh Mala", category: "rudraksh", benefit: "General wellbeing, peace of mind", priceINR: 1100, image: "📿" },
  { id: "1-mukhi-rudraksh", name: "1 Mukhi Rudraksh", category: "rudraksh", benefit: "Spiritual growth, removes negativity", priceINR: 21000, image: "📿" },
  { id: "11-mukhi-rudraksh", name: "11 Mukhi Rudraksh", category: "rudraksh", benefit: "Protection, confidence", priceINR: 5100, image: "📿" },
  { id: "sri-yantra", name: "Sri Yantra (Copper)", category: "yantra", benefit: "Wealth, abundance, harmony at home", priceINR: 1500, image: "🔯" },
  { id: "kuber-yantra", name: "Kuber Yantra", category: "yantra", benefit: "Prosperity and financial stability", priceINR: 1200, image: "🔯" },
  { id: "rudraksh-bracelet", name: "Rudraksh Bracelet", category: "other", benefit: "Everyday protection, calm mind", priceINR: 650, image: "📿" },
];
