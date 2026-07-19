# Awadh Astro — "Temple Gold" handoff

Drop-in files for your Next.js app. Paths below mirror your repo (`~/Documents/Personal/awadh-astro`).
Everything is plain CSS + TS (no Tailwind), matching your existing conventions.

> **Note:** the TypeScript files ship with a `.txt` suffix (e.g. `layout.tsx.txt`). **Remove the `.txt`** when you copy them in → `layout.tsx`. (The suffix only stops the tooling here from trying to bundle them.)

## What changed / what's new

| File | Action | Destination |
|---|---|---|
| `src/app/globals.css` | **Replace** | `src/app/globals.css` — full Temple Gold retheme. Also *adds* styling for classes your current CSS didn't cover yet (dosha-card, badge, detail-grid, dasha-*, yoga-*, puja-*, confirm-*, checkbox-row) so every page is fully styled. |
| `src/app/layout.tsx.txt` → `layout.tsx` | **Replace** | Swaps display font `Fraunces` → `Marcellus`, sets dark `themeColor` / `colorScheme`. |
| `src/components/Header.tsx.txt` → `Header.tsx` | **Replace** | Om (ॐ) glyph logo, adds **Match Kundali** nav link, active-state uses `startsWith`. |
| `src/components/BottomNav.tsx.txt` → `BottomNav.tsx` | **Replace** | Removes emoji → inline SVG line icons. Tabs: Home · Kundali · Seva · Talk · AI Chat. |
| `src/lib/matching.ts.txt` → `matching.ts` | **New** | Ashtakoot Guna Milan compute (mock, deterministic). Self-contained types. |
| `src/app/match/page.tsx.txt` → `page.tsx` | **New** | Kundali Matching page — % gauge, 8-koota breakdown, Mangal check, verdict → puja/astrologer CTAs. Reachable at `/match`. |

`preview.html` is a static CSS-only preview of the look — not part of the app.

## Install steps
1. Copy the six files above into your repo at the mapped paths (create `src/app/match/`), **removing the `.txt` suffix** from each TS file.
2. No new dependencies. `Marcellus` is already in `next/font/google`.
3. `npm run dev` → visit `/match`.

## Small follow-ups (hardcoded colors that don't suit a dark theme)
These pages use inline light-mode hex values that will be low-contrast on Temple Gold — swap for CSS vars:
- `src/app/astrologers/page.tsx` — `color:"#4b5563"` → `color:"var(--ink-soft)"`; `color:"#16a34a"` → `color:"var(--green)"`.
- `src/app/kundali/page.tsx` — error text `color:"#dc2626"` → `color:"var(--danger)"`.
- `src/app/plus/page.tsx` — `color:"#4b5563"` and `color:"#6b7280"` → `color:"var(--ink-soft)"` / `var(--muted)"`.
- Emoji still live in page *content* (kundali section titles 🗓️🪐🛡️, seva perks 📹🌍, chat welcome 🙏, AstrologerCard ⭐/✔). Replace at your pace; the CSS no longer depends on any of them.

## Kundali Matching — production seam
`src/lib/matching.ts` returns mock deterministic scores. In production, replace the body of
`matchKundali()` with your Swiss-Ephemeris astrology API's Guna Milan endpoint (Prokerala /
VedicAstroAPI / AstrologyAPI.com). Keep the returned `MatchResult` shape identical and the UI
needs no changes. **Never compute matching with an LLM.**

## Design tokens (for building more pages)
All defined at the top of `globals.css`:
`--bg #1b0f0a` · `--surface #2b1b13` · `--gold #e0a63a` · `--gold-bright #eeba57` · `--gold-deep #c4842a`
· `--ink #f4e7cc` · `--ink-soft #cbb488` · `--line #4a3122` · `--green #86c489` · `--danger #e07a5f`.
Display font: Marcellus. Body/Devanagari: Mukta. Ornament: `.divider .di`, `.hero::before` mandala.
