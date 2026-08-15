"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { DICTIONARIES, type Dictionary, type Locale } from "./dictionary";

const STORAGE_KEY = "awadh-lang";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Dictionary;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored && stored in DICTIONARIES) setLocaleState(stored);
  }, []);

  function setLocale(l: Locale) {
    setLocaleState(l);
    localStorage.setItem(STORAGE_KEY, l);
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t: DICTIONARIES[locale] }}>
      {children}
    </LanguageContext.Provider>
  );
}

/** Access the current locale + translated chrome strings. Must be used under LanguageProvider. */
export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
