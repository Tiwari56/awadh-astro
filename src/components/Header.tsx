"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/kundali", label: "Free Kundali" },
  { href: "/astrologers", label: "Talk to Astrologer" },
  { href: "/chat", label: "AI Astro Chat" },
  { href: "/plus", label: "Awadh Plus" },
];

export default function Header() {
  const pathname = usePathname();
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="logo">
          AWADH <span>ASTRO</span>
        </Link>
        <nav className="nav">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={pathname === l.href ? "active" : ""}>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
