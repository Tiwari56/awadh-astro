/**
 * AI chat provider configuration (env-driven) — mirrors astrology/config.ts's
 * pattern on purpose, so picking this codebase back up feels familiar.
 *
 * Two independent switches, deliberately:
 *   AI_PROVIDER        — which chat strategy ("dummy" or "llm").
 *   AI_MODEL_PROVIDER  — which vendor the "llm" strategy calls
 *                        ("gemini" | "openai" | "anthropic").
 *
 * That split is what makes the model swappable: pointing at a different
 * vendor or model is an env change, never a code change. See llm-client.ts
 * for the adapters.
 *
 * Minimum to go live with Gemini:
 *   AI_PROVIDER=llm
 *   AI_MODEL_PROVIDER=gemini
 *   AI_MODEL_API_KEY=<key from Google AI Studio>
 *   AI_MODEL=gemini-2.0-flash        (optional — adapter default)
 */

export type AiProviderName = "dummy" | "llm";

export const aiConfig = {
  provider: (process.env.AI_PROVIDER as AiProviderName) || "dummy",
  llm: {
    /** Vendor: "gemini" (default) | "openai" | "anthropic". */
    modelProvider: process.env.AI_MODEL_PROVIDER,
    /** Model id. Falls back to the adapter's default when unset. */
    model: process.env.AI_MODEL,
    apiKey: process.env.AI_MODEL_API_KEY,
    /** Optional future retrieval layer (classical texts, remedy content). */
    vectorStoreUrl: process.env.AI_VECTOR_STORE_URL,
  },
} as const;

/** True only when the LLM strategy is selected AND a key is present. */
export function isLlmConfigured(): boolean {
  return aiConfig.provider === "llm" && Boolean(aiConfig.llm.apiKey);
}
