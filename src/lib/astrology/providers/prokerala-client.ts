import { astrologyConfig } from "../config";

/**
 * Shared Prokerala v2 OAuth2 client-credentials client, used by both the
 * kundali provider and the kundali-matching provider so the token cache and
 * request plumbing exist in exactly one place.
 *
 * Verified against Prokerala's live docs/spec (Aug 2026):
 *   - Base:  https://api.prokerala.com/v2   (token endpoint is one level up:
 *            https://api.prokerala.com/token)
 *   - Every data endpoint is under /astrology/... — e.g. the full path for
 *     kundli-matching is https://api.prokerala.com/v2/astrology/kundli-matching
 *   - OpenAPI spec: https://api.prokerala.com/spec/astrology.v2.yaml
 *   - Interactive docs: https://api.prokerala.com/docs
 */

interface CachedToken {
  accessToken: string;
  expiresAt: number; // epoch ms
}

let tokenCache: CachedToken | null = null;

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now + 60_000) {
    return tokenCache.accessToken;
  }

  const { clientId, clientSecret, baseUrl } = astrologyConfig.prokerala;
  // Token endpoint lives at the account root, not under /v2.
  const tokenUrl = baseUrl.replace(/\/v2\/?$/, "") + "/token";
  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId!,
      client_secret: clientSecret!,
    }),
  });

  if (!res.ok) {
    throw new Error(`Prokerala auth failed: ${res.status} ${await res.text()}`);
  }

  const json = (await res.json()) as { access_token: string; expires_in: number };
  tokenCache = {
    accessToken: json.access_token,
    expiresAt: now + json.expires_in * 1000,
  };
  return json.access_token;
}

/**
 * GET a Prokerala astrology endpoint. `baseUrl` defaults to
 * "https://api.prokerala.com" (no version segment), so `path` must include
 * it: e.g. "/v2/astrology/kundli-matching/advanced".
 */
export async function prokeralaGet<T>(path: string, params: Record<string, string>): Promise<T> {
  const token = await getAccessToken();
  const { baseUrl } = astrologyConfig.prokerala;
  const qs = new URLSearchParams({ ayanamsa: String(astrologyConfig.ayanamsa), ...params });

  const res = await fetch(`${baseUrl}${path}?${qs}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Prokerala ${path} failed: ${res.status} ${await res.text()}`);
  }
  const json = (await res.json()) as { data?: T };
  if (!json.data) throw new Error(`Prokerala ${path} returned no data`);
  return json.data;
}

/** Enrichment fetch that never throws — returns null so the caller can degrade gracefully. */
export async function prokeralaGetSafe<T>(path: string, params: Record<string, string>): Promise<T | null> {
  try {
    return await prokeralaGet<T>(path, params);
  } catch {
    return null;
  }
}

/** `{lat: 26.79, lng: 82.20}` -> "26.79,82.20", the format every Prokerala coordinates param expects. */
export function coordsParam(lat: number, lng: number): string {
  return `${lat},${lng}`;
}
