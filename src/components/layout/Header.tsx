"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { label: "Puja / Seva", href: "/seva" },
  {
    label: "Consultations",
    href: "/astrologers",
    dropdown: [
      { label: "Chat with Astrologer", href: "/astrologers" },
      { label: "Call an Astrologer", href: "/astrologers" },
      { label: "AI Astro Chat", href: "/chat" },
    ],
  },
  {
    label: "Free Services",
    href: "/kundali",
    dropdown: [
      { label: "Free Kundali", href: "/kundali" },
      { label: "Kundali Matching", href: "/match" },
      { label: "AI Chat", href: "/chat" },
    ],
  },
  {
    label: "Horoscope",
    href: "/kundali",
    dropdown: [
      { label: "Daily Horoscope", href: "/kundali" },
      { label: "Weekly Horoscope", href: "/kundali" },
      { label: "Monthly Horoscope", href: "/kundali" },
      { label: "Yearly Horoscope", href: "/kundali" },
    ],
  },
  { label: "Awadh Plus", href: "/plus" },
];

const tickerItems = [
  "🎉 First consultation FREE — Use code AWADH1ST",
  "✨ 48,726+ Verified Ayodhya Pandits",
  "🔱 Live Pujas from Hanuman Garhi & Ram Ki Paidi",
  "⭐ Rated 4.8/5 by 9.5 Crore users",
  "🪔 Prasad delivered to your door",
];

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Ticker */}
      <div className="promo-ticker" aria-label="Promotions">
        <div className="ticker-track">
          {[...tickerItems, ...tickerItems].map((t, i) => (
            <div key={i} className="ticker-item">
              {t}
              <span>·</span>
            </div>
          ))}
        </div>
      </div>

      <header className="site-header">
        <div className="container header-inner">
          {/* Left: mobile btn + logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {mobileOpen
                  ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
                  : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
                }
              </svg>
            </button>
            <Link href="/" className="logo">
              <div className="logo-om">ॐ</div>
              <div>
                <div className="logo-text">AWADH <span>ASTRO</span></div>
                <div className="logo-sub">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  Ayodhya, U.P.
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop nav */}
          <nav className="nav" aria-label="Primary navigation">
            {navItems.map((item) => (
              <div key={item.label} className="nav-dropdown-wrap">
                <Link href={item.href} className={pathname === item.href ? "active" : ""}>
                  {item.label}
                  {item.dropdown && (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" style={{ marginLeft: 2, opacity: 0.5 }}>
                      <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </Link>
                {item.dropdown && (
                  <div className="nav-dropdown">
                    {item.dropdown.map((d) => (
                      <Link key={d.label} href={d.href} className="nav-dropdown-item">
                        {d.label}
                        <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                          <path d="M3 8h10M10 4.5l3.5 3.5-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Desktop right */}
          <div className="header-cta">
            <div className="header-balance">
              ₹&nbsp;250
            </div>
            <Link href="/astrologers" className="btn btn-primary btn-sm">
              Chat Now
            </Link>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="mobile-drawer">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/astrologers" className="btn btn-primary btn-sm" style={{ marginTop: 16, width: "100%" }} onClick={() => setMobileOpen(false)}>
              Chat with Astrologer
            </Link>
          </div>
        )}
      </header>
    </>
  );
}
