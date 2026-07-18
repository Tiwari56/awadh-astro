import { NextRequest, NextResponse } from "next/server";

/**
 * AI astro chat endpoint.
 *
 * PRODUCTION architecture (model-agnostic — Grok / GPT / Claude / Gemini):
 *   1. Fetch the user's stored kundali (computed by the astrology API — never by the LLM).
 *   2. Build a system prompt containing the chart data + guardrails
 *      (no medical/financial directives, always note guidance is spiritual).
 *   3. Call the LLM provider behind this single interface; add RAG over
 *      classical texts to reduce hallucination.
 *   4. Log the conversation for quality & compliance.
 *
 * The mock below rotates canned responses so the UI is fully testable.
 */

const MOCK_REPLIES = [
  "Namaste 🙏 Based on your chart, Jupiter's position suggests this is a favourable period for learning and long-term planning. What would you like to explore — career, relationships, or an upcoming decision?",
  "Your Moon sign indicates emotional clarity improves after the 14th of this month. For important conversations, mornings will serve you better than evenings.",
  "Saturn's current transit rewards patience and consistent effort. Avoid shortcuts in money matters this fortnight — steady steps bring the result you want.",
  "That is a thoughtful question. Astrologically, your current dasha favours new beginnings, but I'd recommend confirming the exact muhurat with one of our Ayodhya-verified astrologers for such an important step.",
];

let counter = 0;

export async function POST(req: NextRequest) {
  const { message } = (await req.json()) as { message?: string };

  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  // Simulate model latency
  await new Promise((r) => setTimeout(r, 600));

  const reply = MOCK_REPLIES[counter % MOCK_REPLIES.length];
  counter += 1;

  return NextResponse.json({ reply });
}
