import { aiConfig } from "./config";

/**
 * Vendor-agnostic chat-completion client.
 *
 * One `LlmAdapter` per vendor, selected by AI_MODEL_PROVIDER. Everything
 * above this file (the chat provider, prompts, routes) speaks only the
 * neutral `LlmMessage`/`callLlm` shape, so switching Gemini → OpenAI →
 * Anthropic is an env change plus one adapter, never an app change.
 *
 * Deliberately uses plain fetch rather than each vendor's SDK: no extra
 * dependencies, no vendor lock-in in package.json, and it runs unchanged on
 * both the Node and Edge runtimes.
 */

export interface LlmMessage {
  role: "user" | "assistant";
  content: string;
}

export interface LlmRequest {
  system: string;
  messages: LlmMessage[];
  maxOutputTokens?: number;
  temperature?: number;
}

interface LlmAdapter {
  readonly vendor: string;
  /** Model id used when AI_MODEL is not set. */
  readonly defaultModel: string;
  complete(req: LlmRequest, model: string, apiKey: string): Promise<string>;
}

/** Fetch with a timeout so a hung model call can't hold a request open forever. */
async function postJson(url: string, body: unknown, headers: Record<string, string>, timeoutMs = 25_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${text.slice(0, 500)}`);
    return JSON.parse(text);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Google Gemini — generateContent REST API.
 * Note Gemini names the assistant role "model" (not "assistant"), and takes
 * the system prompt as a separate `system_instruction` field.
 */
const geminiAdapter: LlmAdapter = {
  vendor: "gemini",
  defaultModel: "gemini-2.0-flash",
  async complete(req, model, apiKey) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
    const data = await postJson(
      url,
      {
        system_instruction: { parts: [{ text: req.system }] },
        contents: req.messages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
        generationConfig: {
          temperature: req.temperature ?? 0.7,
          maxOutputTokens: req.maxOutputTokens ?? 600,
        },
      },
      { "x-goog-api-key": apiKey }
    );

    const parts = data?.candidates?.[0]?.content?.parts;
    const text = Array.isArray(parts) ? parts.map((p: { text?: string }) => p?.text ?? "").join("") : "";
    if (!text.trim()) {
      // Most commonly a safety block or an empty candidate — surface it so the
      // dispatcher can fall back to the dummy provider rather than showing a blank bubble.
      const reason = data?.candidates?.[0]?.finishReason ?? data?.promptFeedback?.blockReason ?? "empty response";
      throw new Error(`Gemini returned no text (${reason})`);
    }
    return text.trim();
  },
};

/** OpenAI — chat completions. System prompt is just the first message. */
const openaiAdapter: LlmAdapter = {
  vendor: "openai",
  defaultModel: "gpt-4o-mini",
  async complete(req, model, apiKey) {
    const data = await postJson(
      "https://api.openai.com/v1/chat/completions",
      {
        model,
        messages: [{ role: "system", content: req.system }, ...req.messages],
        temperature: req.temperature ?? 0.7,
        max_tokens: req.maxOutputTokens ?? 600,
      },
      { Authorization: `Bearer ${apiKey}` }
    );
    const text = data?.choices?.[0]?.message?.content ?? "";
    if (!text.trim()) throw new Error("OpenAI returned no text");
    return text.trim();
  },
};

/** Anthropic — messages API. System prompt is a top-level field. */
const anthropicAdapter: LlmAdapter = {
  vendor: "anthropic",
  defaultModel: "claude-sonnet-5",
  async complete(req, model, apiKey) {
    const data = await postJson(
      "https://api.anthropic.com/v1/messages",
      {
        model,
        system: req.system,
        messages: req.messages,
        max_tokens: req.maxOutputTokens ?? 600,
        temperature: req.temperature ?? 0.7,
      },
      { "x-api-key": apiKey, "anthropic-version": "2023-06-01" }
    );
    const text = Array.isArray(data?.content)
      ? data.content.map((b: { text?: string }) => b?.text ?? "").join("")
      : "";
    if (!text.trim()) throw new Error("Anthropic returned no text");
    return text.trim();
  },
};

const ADAPTERS: Record<string, LlmAdapter> = {
  gemini: geminiAdapter,
  google: geminiAdapter, // alias
  openai: openaiAdapter,
  anthropic: anthropicAdapter,
};

export function resolveAdapter(): LlmAdapter {
  const name = (aiConfig.llm.modelProvider ?? "gemini").toLowerCase();
  const adapter = ADAPTERS[name];
  if (!adapter) {
    throw new Error(
      `Unknown AI_MODEL_PROVIDER "${name}". Supported: ${Object.keys(ADAPTERS).join(", ")}.`
    );
  }
  return adapter;
}

/** Single entry point used by the chat provider. */
export async function callLlm(req: LlmRequest): Promise<string> {
  const adapter = resolveAdapter();
  const apiKey = aiConfig.llm.apiKey;
  if (!apiKey) throw new Error("AI_MODEL_API_KEY is not set");
  const model = aiConfig.llm.model || adapter.defaultModel;
  return adapter.complete(req, model, apiKey);
}
