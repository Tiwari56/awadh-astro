import type { BirthDetails, KundaliResult } from "@/types";
import type { GeoLocation } from "./geocode";

/**
 * A birth event resolved into everything a Swiss-Ephemeris engine needs:
 * the raw details, the geocoded location, and an ISO 8601 datetime that already
 * carries the correct UTC offset for the place & moment of birth.
 */
export interface BirthContext {
  details: BirthDetails;
  location: GeoLocation;
  /** e.g. "1994-03-21T04:35:00+05:30" */
  datetime: string;
  /**
   * UI locale ("en" | "hi" | "bn" | "mr"). Prokerala's endpoints accept a
   * `language` param — real providers should pass this through so
   * descriptive text (dosha/yoga descriptions etc.) comes back native.
   * Defaults to "en" when absent. The mock provider ignores this; Hindi
   * display for the mock's output is instead handled by the presentation
   * layer's vedic-terms.ts lookup.
   */
  locale?: string;
}

/**
 * Provider contract. Every backend (mock, Prokerala, VedicAstroAPI, …) maps its
 * own response shape into our KundaliResult so the rest of the app never sees
 * provider-specific data.
 *
 * RULE: providers compute planetary positions numerically (ephemeris). They do
 * NOT use an LLM for positions. LLM interpretation happens later, in the chat
 * layer, over the chart a provider returns.
 */
export interface AstrologyProvider {
  readonly name: string;
  computeKundali(ctx: BirthContext): Promise<KundaliResult>;
}
