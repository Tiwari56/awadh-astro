"use client";

import { useEffect, useState } from "react";

type ThemePref = "light" | "dark" | "auto";
const STORAGE_KEY = "awadh-theme";

/**
 * Applies the stored (or default "auto") theme preference to <html data-theme>.
 * "auto" removes the attribute so the `prefers-color-scheme` CSS media query
 * decides. Exported so the pre-hydration inline script (in layout.tsx) and
 * this component share one source of truth for the storage key/logic.
 */
export function applyTheme(pref: ThemePref) {
  const root = document.documentElement;
  if (pref === "auto") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", pref);
}

const OPTIONS: { key: ThemePref; label: string; icon: React.ReactNode }[] = [
  {
    key: "light",
    label: "Light",
    icon: (
      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
    ),
  },
  {
    key: "auto",
    label: "Auto",
    icon: <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M8 20h8M12 17v3" /></svg>,
  },
  {
    key: "dark",
    label: "Dark",
    icon: <svg viewBox="0 0 24 24"><path d="M21 12.5A8.5 8.5 0 1 1 11.5 3a7 7 0 0 0 9.5 9.5Z" /></svg>,
  },
];

/** Light / Dark / Auto theme switcher — persists to localStorage, no FOUC (see layout.tsx head script). */
export default function ThemeToggle() {
  const [pref, setPref] = useState<ThemePref>("auto");

  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as ThemePref) || "auto";
    setPref(stored);
  }, []);

  function choose(next: ThemePref) {
    setPref(next);
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }

  return (
    <div className="theme-toggle" role="group" aria-label="Theme">
      {OPTIONS.map((o) => (
        <button
          key={o.key}
          type="button"
          className={pref === o.key ? "active" : ""}
          aria-pressed={pref === o.key}
          aria-label={o.label}
          title={o.label}
          onClick={() => choose(o.key)}
        >
          {o.icon}
        </button>
      ))}
    </div>
  );
}
