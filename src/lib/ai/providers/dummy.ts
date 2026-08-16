import { PLUS_PLANS } from "@/lib/data/plans";
import { classifyIntent } from "../intent";
import type { AiProvider, AiReply, ChatContext } from "../provider";

/**
 * Dummy chat provider — no model call, no cost, always available.
 *
 * Two branches, matching the founder's brief:
 *  - "general" messages get a rotating canned reply (free-form talk).
 *  - "consulting"-flavoured messages (booking/pricing/subscribe/etc. — see
 *    ../intent.ts) get a structured upsell card showing what Awadh Plus
 *    unlocks, instead of a plain text bubble.
 *
 * TODO(RAG): swap this provider for ./rag.ts once a model + retrieval
 * pipeline is chosen. The intent split can stay — only how each branch's
 * reply text gets generated should change (real generation instead of
 * canned strings; the upsell branch likely stays templated even with RAG,
 * since it's a conversion surface, not a knowledge-retrieval one).
 */

const GENERAL_REPLIES = [
  "Namaste 🙏 Based on your chart, Jupiter's position suggests this is a favourable period for learning and long-term planning. What would you like to explore — career, relationships, or an upcoming decision?",
  "Your Moon sign indicates emotional clarity improves after the 14th of this month. For important conversations, mornings will serve you better than evenings.",
  "Saturn's current transit rewards patience and consistent effort. Avoid shortcuts in money matters this fortnight — steady steps bring the result you want.",
  "That is a thoughtful question. Astrologically, your current dasha favours new beginnings, but I'd recommend confirming the exact muhurat with one of our Ayodhya-verified astrologers for such an important step.",
];

let counter = 0;

export const dummyProvider: AiProvider = {
  name: "dummy",
  async generateReply(ctx: ChatContext): Promise<AiReply> {
    // Simulate model latency so the UI's loading state is exercised honestly.
    await new Promise((r) => setTimeout(r, 500));

    if (classifyIntent(ctx.message) === "consulting") {
      const plus = PLUS_PLANS.find((p) => p.id === "plus") ?? PLUS_PLANS[PLUS_PLANS.length - 1];
      return {
        kind: "upsell",
        text: `Namaste 🙏 For a full consultation or daily guidance, here's what ${plus.name} unlocks:`,
        upsell: {
          headline: `${plus.name} — ₹${plus.pricePerYear}/year`,
          benefits: plus.features,
          ctaLabel: "See Awadh Plus",
          ctaHref: "/plus",
        },
      };
    }

    const text = GENERAL_REPLIES[counter % GENERAL_REPLIES.length];
    counter += 1;
    return { kind: "text", text };
  },
};
