"use client";

import { useEffect, useRef, useState } from "react";
import { LOCALES, LOCALE_LABELS } from "@/lib/i18n/dictionary";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="lang-switch" ref={ref}>
      <button type="button" className="lang-switch-btn" onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
        </svg>
        {LOCALE_LABELS[locale]}
      </button>
      {open && (
        <div className="lang-switch-menu" role="menu">
          {LOCALES.map((l) => (
            <button
              key={l}
              type="button"
              role="menuitem"
              className={l === locale ? "active" : ""}
              onClick={() => { setLocale(l); setOpen(false); }}
            >
              {LOCALE_LABELS[l]} {l === locale && "✓"}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
