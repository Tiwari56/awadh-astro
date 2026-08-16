import type { ChatUpsellPayload, KundaliResult } from "@/types";

/** One prior turn, oldest-first, for future multi-turn grounding. */
export interface ChatTurn {
  role: "user" | "ai";
  text: string;
}

export interface ChatContext {
  message: string;
  history: ChatTurn[];
  /**
   * TODO(RAG): populate this from the caller's saved kundali once user
   * accounts/sessions exist, and inject it into the system prompt so replies
   * are grounded in the REAL chart — never let the model invent positions.
   * Positions always come from the astrology provider (see ../astrology),
   * never from the LLM. This field is unused by the dummy provider.
   */
  kundali?: KundaliResult;
}

export interface AiReply {
  text: string;
  kind: "text" | "upsell";
  upsell?: ChatUpsellPayload;
}

/**
 * Provider contract for the chat layer — mirrors astrology/provider.ts's
 * AstrologyProvider pattern so the two swappable-backend seams in this
 * codebase look and feel the same. Swap providers/dummy.ts for
 * providers/rag.ts once a real model + retrieval pipeline is wired; the rest
 * of the app (the /api/chat route, the chat UI) never changes.
 */
export interface AiProvider {
  readonly name: string;
  generateReply(ctx: ChatContext): Promise<AiReply>;
}
