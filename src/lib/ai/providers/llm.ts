import type { AiProvider, AiReply, ChatContext } from "../provider";
import { chartBlock, GUARDRAILS, languageBlock, retrieveContext, SYSTEM_PERSONA } from "../prompts";
import { classifyIntent } from "../intent";
import { callLlm, type LlmMessage } from "../llm-client";
import { PLUS_PLANS } from "@/lib/data/plans";

/**
 * Real model-backed chat provider. Vendor-agnostic: it assembles the prompt
 * and hands it to llm-client.ts, which owns the per-vendor request shapes.
 *
 * The consulting branch stays a TEMPLATED upsell card rather than model
 * output — it's a conversion surface that should stay consistent and
 * on-brand, and it costs nothing to render.
 *
 * Chart data is injected from the astrology provider's computed result. The
 * guardrails forbid the model from inventing positions; it may only reason
 * about the values handed to it.
 */

/** Cap history so a long session can't blow up token cost or latency. */
const MAX_HISTORY_TURNS = 10;

export const llmProvider: AiProvider = {
  name: "llm",
  async generateReply(ctx: ChatContext): Promise<AiReply> {
    if (classifyIntent(ctx.message) === "consulting") {
      const plus = PLUS_PLANS.find((p) => p.id === "plus") ?? PLUS_PLANS[PLUS_PLANS.length - 1];
      return {
        kind: "upsell",
        text: `For a full consultation or daily guidance, here's what ${plus.name} unlocks:`,
        upsell: {
          headline: `${plus.name} — ₹${plus.pricePerYear}/year`,
          benefits: plus.features,
          ctaLabel: "See Awadh Plus",
          ctaHref: "/plus",
        },
      };
    }

    const retrieved = await retrieveContext(ctx.message);
    const system = [
      SYSTEM_PERSONA,
      languageBlock(ctx.locale),
      chartBlock(ctx.kundali),
      retrieved ? `Reference material:\n${retrieved}` : "",
      GUARDRAILS,
    ]
      .filter(Boolean)
      .join("\n\n");

    const messages: LlmMessage[] = [
      ...ctx.history.slice(-MAX_HISTORY_TURNS).map<LlmMessage>((turn) => ({
        role: turn.role === "ai" ? "assistant" : "user",
        content: turn.text,
      })),
      { role: "user", content: ctx.message },
    ];

    const text = await callLlm({ system, messages });
    return { kind: "text", text };
  },
};
