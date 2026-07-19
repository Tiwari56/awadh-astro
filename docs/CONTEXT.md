# Awadh Astro — Project Context (handoff)

## What this is
"Awadh Astro" — a digital astrology platform (like Astrotalk) based in Ayodhya, targeting the huge pilgrim footfall (~23 crore visitors Jan–Jun 2025) plus online users across India. Founder: Nishit Tiwari. Currently at MVP-shell stage.

## Business model (validated against market research)
- Live 1-on-1 astrologer consultations (chat/call), platform takes 20–25% commission (Astrotalk model; astrologer rates ₹10–500/min).
- "Awadh Plus" subscription ₹999/yr: personalized muhurat alerts (good days to buy/invest), caution-day warnings, Rahu Kaal / Sade Sati notifications, monthly kundali report, unlimited AI chat, 10% off consultations.
- Free kundali generation = acquisition hook. QR codes at Ayodhya hotels/shops = near-zero CAC funnel.
- Differentiator: "Ayodhya Verified" astrologer badge, Hindi-first UI.
- Market: India astrology apps ~USD 0.24B (2025), ~49% CAGR. Leader Astrotalk: ₹1,214 Cr revenue FY25, IPO-bound.
- Year-1 plan: investment ₹28–45 L (lean), revenue scenarios ₹12 L (conservative) / ₹35–40 L (base) / ₹1.2–1.5 Cr (optimistic). Breakeven expected year 2–3.

## Current codebase
Next.js 14 (App Router) + TypeScript, plain CSS (NO Tailwind — user's explicit choice). Located at `~/Documents/Personal/awadh-astro`. Builds clean (`next build` passes, strict TS). Run: `npm install && npm run dev` → localhost:3000.

```
src/
  app/
    page.tsx                landing
    kundali/page.tsx        birth form → kundali result (client)
    astrologers/page.tsx    directory + live-status filter (client)
    chat/page.tsx           AI chat UI (client)
    plus/page.tsx           Free vs Plus plans
    api/kundali/route.ts    POST — computes kundali (mock)
    api/chat/route.ts       POST — AI reply (mock, canned responses)
    layout.tsx, globals.css (all styling here, CSS variables, saffron/amber theme)
  components/  Header, Footer, AstrologerCard
  lib/         astrology.ts (mock kundali, deterministic hash), astrologers.ts (6 mock astrologers), plans.ts
  types/       BirthDetails, KundaliResult, PlanetPosition, Astrologer, ChatMessage, PlusPlan
```

## Everything currently runs on typed dummy data. Production seams (in priority order):
1. `src/lib/astrology.ts` — replace mock with Swiss-Ephemeris astrology API (Prokerala / VedicAstroAPI / AstrologyAPI.com). RULE: never compute planetary positions with an LLM (hallucination risk) — LLM only interprets charts computed by the API.
2. `src/app/api/chat/route.ts` — wire LLM (keep model-agnostic: Grok/GPT/Claude/Gemini) + RAG over classical texts; pass computed chart in system prompt; guardrails against medical/financial directives; label as AI.
3. Auth — phone OTP (NextAuth), standard for this market.
4. `src/lib/astrologers.ts` — real backend: PostgreSQL for users/wallets/transactions, Redis for live presence.
5. Payments — Razorpay (UPI) for wallet top-ups + Plus subscription.
6. Live chat/calls — Agora SDK (what Astrotalk uses).
7. Notifications — FCM + WhatsApp Business API.

## Compliance notes
No dedicated astrology law in India, but: DPDP Act 2023 (birth data = personal data: consent, India storage, deletion), Consumer Protection Act 2019, IT Act 2000. Always show disclaimer: spiritual/informational only, not medical/legal/financial advice. Never promise outcomes.

## Next planned steps
Wire real astrology API → phone OTP auth → Razorpay → astrologer onboarding flow → React Native Android app.
