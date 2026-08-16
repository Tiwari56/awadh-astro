/**
 * Prompt templates for the future RAG-backed chat provider. NOT used by
 * providers/dummy.ts today — this file exists so the shape of the eventual
 * system prompt is decided and reviewable now, rather than invented under
 * time pressure later.
 *
 * TODO(RAG): when wiring providers/rag.ts, build the system prompt as:
 *   SYSTEM_PERSONA + "\n\n" + chartBlock(ctx.kundali) + "\n\n" +
 *   retrievedContextBlock(retrieval results) + "\n\n" + GUARDRAILS
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
  if (!kundali) return "No birth chart is available for this user yet — do not assume one.";
  return [
    "The user's computed birth chart (from the astrology API, not invented):",
    `Ascendant: ${kundali.ascendant} · Moon: ${kundali.moonSign} · Sun: ${kundali.sunSign} · Nakshatra: ${kundali.nakshatra}`,
    `Current Mahadasha: ${kundali.currentDasha}`,
    `Mangal Dosha: ${kundali.mangalDosha.present ? "present" : "absent"} · Sade Sati: ${kundali.sadeSati.present ? "active" : "not active"}`,
  ].join("\n");
}

/**
 * TODO(RAG): retrieval placeholder. Wire this to a vector store over
 * classical texts (see aiConfig.rag.vectorStoreUrl) and return the top-k
 * passages relevant to the user's message, formatted for prompt injection.
 */
export async function retrieveContext(_message: string): Promise<string> {
  return "";
}
