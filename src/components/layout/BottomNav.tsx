"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

/**
 * Mobile bottom tab bar — primary navigation for phone users (the core Ayodhya
 * audience). Hidden on >=768px via CSS, where the top-bar nav takes over.
 * Devotional line icons (no emoji), Om-inspired, thumb-reachable.
 */
type Tab = { href: string; labelKey: keyof ReturnType<typeof useLanguage>["t"]["bottomNav"]; icon: ReactNode };

const I = (d: ReactNode) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">{d}</svg>
);

const tabs: Tab[] = [
  { href: "/", labelKey: "home", icon: I(<><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></>) },
  { href: "/kundali", labelKey: "kundali", icon: I(<><circle cx="12" cy="12" r="9" /><path d="M12 3v18M3 12h18" /></>) },
  { href: "/seva", labelKey: "seva", icon: I(<><path d="M12 3c1.5 2 2.5 3.2 2.5 5a2.5 2.5 0 0 1-5 0C9.5 6.2 10.5 5 12 3Z" /><path d="M6 21h12M7 21v-4h10v4" /></>) },
  { href: "/astrologers", labelKey: "talk", icon: I(<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />) },
  { href: "/chat", labelKey: "aiChat", icon: I(<path d="M12 2a2 2 0 0 1 2 2v1a7 7 0 0 1 4 6v3l2 3H4l2-3v-3a7 7 0 0 1 4-6V4a2 2 0 0 1 2-2Z" />) },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();
  return (
    <nav className="bottom-nav" aria-label="Primary">
      {tabs.map((tab) => {
        const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
        return (
          <Link key={tab.href} href={tab.href} className={active ? "active" : ""} aria-current={active ? "page" : undefined}>
            <span className="ic" aria-hidden="true">{tab.icon}</span>
            <span className="lbl">{t.bottomNav[tab.labelKey]}</span>
          </Link>
        );
      })}
    </nav>
  );
}
