import { aiConfig, isRagConfigured } from "./config";
import type { AiProvider, AiReply, ChatContext } from "./provider";
import { dummyProvider } from "./providers/dummy";
import { ragProvider } from "./providers/rag";

/**
 * Chat reply entry point. Mirrors astrology/index.ts's computeKundali(): pick
 * the configured provider, fall back to the dummy provider (never a hard
 * failure) if it isn't configured or it throws.
 */
export async function generateChatReply(ctx: ChatContext): Promise<AiReply> {
  const provider: AiProvider = isRagConfigured() ? ragProvider : dummyProvider;

  try {
    return await provider.generateReply(ctx);
  } catch (err) {
    if (provider !== dummyProvider) {
      console.error("[ai] provider failed, falling back to dummy:", err);
      return dummyProvider.generateReply(ctx);
    }
    throw err;
  }
}

export { aiConfig };
export type { AiReply, ChatContext, ChatTurn } from "./provider";
