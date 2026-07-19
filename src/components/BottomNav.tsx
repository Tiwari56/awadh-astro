"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/",            label: "Home",      icon: "🏠" },
  { href: "/kundali",     label: "Kundali",   icon: "🔮" },
  { href: "/astrologers", label: "Consult",   icon: "👳" },
  { href: "/chat",        label: "AI Chat",   icon: "✨" },
  { href: "/plus",        label: "Plus",      icon: "👑" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav" aria-label="Bottom navigation">
      {navLinks.map((l) => (
        <Link key={l.href} href={l.href} className={pathname === l.href ? "active" : ""} aria-label={l.label}>
          <span className="ic">{l.icon}</span>
          <span>{l.label}</span>
        </Link>
      ))}
    </nav>
  );
}
