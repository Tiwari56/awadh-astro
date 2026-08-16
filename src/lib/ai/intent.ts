/**
 * Detects whether a message is asking for a real consultation/detailed
 * reading (→ show the Plus/consulting upsell) vs. general free-form chat.
 *
 * DUMMY implementation: keyword matching. This is intentionally simple and
 * will misfire on phrasing it doesn't recognize — that's an acceptable
 * trade-off for a placeholder.
 *
 * TODO(RAG): replace with either (a) a cheap classification call to the same
 * LLM used for chat, or (b) function-calling / structured output where the
 * model itself decides "general" vs "consulting" as part of one turn instead
 * of a separate pass. Keep the two-branch behavior (general reply vs. upsell
 * card) — only the detection mechanism should change.
 */

const CONSULTING_KEYWORDS = [
  "consult", "consultation", "book", "booking", "talk to", "speak to", "speak with",
  "detailed reading", "full reading", "call an astrologer", "chat with astrologer",
  "real astrologer", "human astrologer", "schedule", "appointment", "subscribe", "subscription",
  "plus plan", "awadh plus", "upgrade", "price", "pricing", "cost", "how much",
];

export type ChatIntent = "general" | "consulting";

export function classifyIntent(message: string): ChatIntent {
  const m = message.toLowerCase();
  return CONSULTING_KEYWORDS.some((kw) => m.includes(kw)) ? "consulting" : "general";
}
