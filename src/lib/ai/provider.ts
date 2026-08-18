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
   * The caller's most recent saved kundali, loaded by /api/chat and injected
   * into the system prompt so replies are grounded in the REAL chart.
   * Positions always come from the astrology provider (see ../astrology),
   * never from the LLM.
   */
  kundali?: KundaliResult;
  /** UI locale ("en" | "hi" | ...) — the model is told to reply in this language. */
  locale?: string;
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
