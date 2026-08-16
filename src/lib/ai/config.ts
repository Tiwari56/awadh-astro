/**
 * AI chat provider configuration (env-driven) — mirrors astrology/config.ts's
 * pattern on purpose, so picking this codebase back up feels familiar.
 *
 * Set AI_PROVIDER=rag once a real model + retrieval pipeline is wired (see
 * providers/rag.ts for what that needs). Until then, "dummy" (default) keeps
 * the chat UI fully testable with canned responses and a rule-based
 * consulting-intent upsell — no external calls, no cost, no key required.
 */

export type AiProviderName = "dummy" | "rag";

export const aiConfig = {
  provider: (process.env.AI_PROVIDER as AiProviderName) || "dummy",
  rag: {
    // TODO(RAG): model + vector-store credentials go here once chosen.
    // Keep this model-agnostic per the project's standing rule — never
    // hardcode a single vendor SDK into the provider; the interface in
    // ./provider.ts is what the rest of the app depends on.
    modelProvider: process.env.AI_MODEL_PROVIDER, // e.g. "anthropic" | "openai" | "google"
    apiKey: process.env.AI_MODEL_API_KEY,
    vectorStoreUrl: process.env.AI_VECTOR_STORE_URL,
  },
} as const;

export function isRagConfigured(): boolean {
  return aiConfig.provider === "rag" && Boolean(aiConfig.rag.apiKey);
}
