# Awadh Astro — Web App (MVP Shell)

Digital astrology platform for Ayodhya & beyond. Next.js 14 (App Router) + TypeScript, plain CSS (no Tailwind).

## Run locally

```bash
npm install
npm run dev
# open http://localhost:3000
```

## What's included

| Route | Feature |
|---|---|
| `/` | Landing page |
| `/kundali` | Birth-details form → kundali result (summary stats, planet table, daily insight) |
| `/astrologers` | Directory with live status filter, ratings, ₹/min, Ayodhya-Verified badge |
| `/chat` | AI astro chat UI with disclaimer |
| `/plus` | Free vs Awadh Plus (₹999/yr) subscription comparison |
| `POST /api/kundali` | Kundali computation endpoint (mock) |
| `POST /api/chat` | AI chat endpoint (mock) |

## Mock → production map

Everything runs on typed mocks so the UI is fully testable. Replace behind these seams:

1. **`src/lib/astrology.ts`** — swap mock for Prokerala / VedicAstroAPI call (Swiss Ephemeris). Never compute charts with an LLM.
2. **`src/app/api/chat/route.ts`** — wire your LLM provider (Grok/GPT/Claude/Gemini) + RAG; chart data goes in the system prompt.
3. **`src/lib/astrologers.ts`** — replace with backend query (PostgreSQL) + Redis presence for live status.
4. **Payments** — add Razorpay checkout on `/plus` and wallet top-ups.
5. **Auth** — add NextAuth (phone OTP is standard for this market).

## Structure

```
src/
  app/           pages + API routes (App Router)
  components/    Header, Footer, AstrologerCard
  lib/           service layer (astrology, astrologers, plans)
  types/         shared domain types
```
