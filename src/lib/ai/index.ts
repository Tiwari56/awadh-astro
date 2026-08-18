import { aiConfig, isLlmConfigured } from "./config";
import type { AiProvider, AiReply, ChatContext } from "./provider";
import { dummyProvider } from "./providers/dummy";
import { llmProvider } from "./providers/llm";

/**
 * Chat reply entry point. Mirrors astrology/index.ts's computeKundali(): pick
 * the configured provider, fall back to the dummy provider (never a hard
 * failure) if it isn't configured or it throws — a model outage or a bad key
 * degrades the chat rather than breaking the page.
 */
export async function generateChatReply(ctx: ChatContext): Promise<AiReply> {
  const provider: AiProvider = isLlmConfigured() ? llmProvider : dummyProvider;

  try {
    return await provider.generateReply(ctx);
  } catch (err) {
    if (provider !== dummyProvider) {
      console.error("[ai] llm provider failed, falling back to dummy:", err);
      return dummyProvider.generateReply(ctx);
    }
    throw err;
  }
}

export { aiConfig };
export type { AiReply, ChatContext, ChatTurn } from "./provider";
