"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Mobile bottom tab bar — the primary navigation for phone users (the core
 * Ayodhya audience). Hidden on ≥768px via CSS, where the top-bar nav takes over.
 * Icons + short labels keep it thumb-reachable and legible on small screens.
 */
const tabs = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/kundali", label: "Kundali", icon: "🪔" },
  { href: "/astrologers", label: "Astrologers", icon: "🙏" },
  { href: "/chat", label: "AI Chat", icon: "✨" },
  { href: "/plus", label: "Plus", icon: "⭐" },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="bottom-nav" aria-label="Primary">
      {tabs.map((t) => {
        const active = t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
        return (
          <Link key={t.href} href={t.href} className={active ? "active" : ""} aria-current={active ? "page" : undefined}>
            <span className="ic" aria-hidden="true">{t.icon}</span>
            <span className="lbl">{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
