/**
 * Prompt templates for the model-backed chat provider (providers/llm.ts).
 * The system prompt is assembled as:
 *   SYSTEM_PERSONA + chartBlock(kundali) + [retrieved context] + GUARDRAILS
 */

/** Base persona — who the assistant is and how it should sound. */
export const SYSTEM_PERSONA = `You are the Awadh Astro AI guide, a warm, knowledgeable Vedic astrology
assistant speaking on behalf of Awadh Astro (Ayodhya). You are helpful and specific, not vague or
mystical-sounding for its own sake. You may reference the user's real birth chart when provided.`;

/**
 * Hard guardrails — MUST be present in every real system prompt, not optional.
 * These exist because astrology-adjacent chat is a recognized regulatory/trust
 * risk area (see CONTEXT.md's compliance notes): no medical, legal, or
 * financial directives, no guaranteed outcomes, always disclose it's AI.
 */
export const GUARDRAILS = `Rules you must always follow:
- Never give medical, legal, or financial directives. If asked, say so plainly and suggest a
  qualified professional in that field — astrology is not a substitute for any of them.
- Never guarantee an outcome ("you WILL get the job/marry them/recover"). Speak in terms of
  favourable/unfavourable periods and tendencies, consistent with classical Vedic astrology.
- Always be clear you are an AI, not a licensed astrologer — for anything consequential, recommend
  booking one of Awadh Astro's Ayodhya-verified human astrologers.
- Never invent planetary positions or chart details. Only reference chart data explicitly provided
  to you in this prompt — it comes from the astrology API's ephemeris computation, never from you.`;

/** Renders the user's REAL computed chart into the prompt — never let the model guess these values. */
export function chartBlock(kundali?: import("@/types").KundaliResult): string {
  if (!kundali) {
    return [
      "No birth chart is available for this user yet — do not assume or invent one.",
      "If the question needs chart data, invite them to generate their free kundali first.",
    ].join("\n");
  }
  const planets = kundali.planets
    ?.map((p) => `${p.planet} in ${p.sign} (house ${p.house}, ${p.nakshatra}${p.retrograde ? ", retrograde" : ""})`)
    .join("; ");
  const doshas = [
    `Mangal Dosha: ${kundali.mangalDosha.present ? `present (${kundali.mangalDosha.severity})` : "absent"}`,
    `Sade Sati: ${kundali.sadeSati.present ? `active (${kundali.sadeSati.severity})` : "not active"}`,
    `Kaal Sarp: ${kundali.kaalSarpDosha.present ? "present" : "absent"}`,
  ].join(" · ");
  return [
    "The user's computed birth chart (from the astrology API's ephemeris — authoritative, never contradict or recompute these):",
    `Ascendant/Lagna: ${kundali.ascendant} · Moon sign: ${kundali.moonSign} · Sun sign: ${kundali.sunSign} · Birth nakshatra: ${kundali.nakshatra}`,
    `Current Mahadasha: ${kundali.currentDasha}`,
    doshas,
    planets ? `Planetary positions: ${planets}` : "",
    kundali.yogas?.length ? `Active yogas: ${kundali.yogas.map((y) => y.name).join(", ")}` : "",
  ].filter(Boolean).join("\n");
}

/** Tells the model which language to answer in. */
export function languageBlock(locale?: string): string {
  const map: Record<string, string> = {
    hi: "Hindi (Devanagari script)",
    bn: "Bengali",
    mr: "Marathi",
    en: "English",
  };
  const lang = map[locale ?? "en"] ?? "English";
  return `Reply in ${lang}. Keep Sanskrit/Jyotish terms (rashi, nakshatra, dasha, dosha) in their traditional form.`;
}

/**
 * TODO(RAG): retrieval placeholder. Wire this to a vector store over
 * classical texts (see aiConfig.rag.vectorStoreUrl) and return the top-k
 * passages relevant to the user's message, formatted for prompt injection.
 */
export async function retrieveContext(_message: string): Promise<string> {
  return "";
}
