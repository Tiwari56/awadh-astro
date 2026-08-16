import type { AiProvider, AiReply, ChatContext } from "../provider";
import { chartBlock, GUARDRAILS, retrieveContext, SYSTEM_PERSONA } from "../prompts";
import { classifyIntent } from "../intent";

/**
 * NOT IMPLEMENTED — template for the future RAG-backed chat provider.
 *
 * When picking this up, the shape is:
 *
 *   1. Pick a model provider (Claude / GPT / Gemini — keep this file
 *      model-agnostic; don't hardcode a vendor SDK call directly here, wrap
 *      it behind its own small client module the way ../../astrology/
 *      providers/prokerala-client.ts wraps Prokerala).
 *   2. Stand up a vector store over classical astrology texts + your own
 *      remedy/FAQ content; implement retrieveContext() in ../prompts.ts to
 *      query it and return the top-k passages for the user's message.
 *   3. Build the system prompt: SYSTEM_PERSONA + chartBlock(ctx.kundali) +
 *      the retrieved context + GUARDRAILS (all three already exist in
 *      ../prompts.ts — this file just needs to assemble and call them).
 *   4. Call the model with ctx.history as prior turns + the new user message.
 *   5. Keep the general/consulting intent split (classifyIntent) — the
 *      "consulting" branch should very likely stay a templated upsell card
 *      (see ./dummy.ts) rather than model-generated, since it's a conversion
 *      surface you want consistent and on-brand, not creative.
 *   6. Log the conversation somewhere for quality review + DPDP compliance
 *      (birth chart data in the prompt is personal data — see CONTEXT.md).
 *
 * Switch to this provider by setting AI_PROVIDER=rag (see ../config.ts) once
 * the above is done — ../index.ts already dispatches on that config and
 * falls back to the dummy provider if this throws.
 */
export const ragProvider: AiProvider = {
  name: "rag",
  async generateReply(ctx: ChatContext): Promise<AiReply> {
    // Referenced so the intended assembly is discoverable from this stub
    // without every import being flagged unused; delete once implemented.
    void classifyIntent(ctx.message);
    void chartBlock(ctx.kundali);
    void (await retrieveContext(ctx.message));
    void SYSTEM_PERSONA;
    void GUARDRAILS;

    throw new Error(
      "ragProvider is not implemented yet — see the TODO block in src/lib/ai/providers/rag.ts. " +
      "Set AI_PROVIDER=dummy (or leave unset) until this is wired."
    );
  },
};
