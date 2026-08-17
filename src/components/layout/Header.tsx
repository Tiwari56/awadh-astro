"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import ThemeToggle from "@/components/ui/ThemeToggle";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const tickerItems: { text: string; href?: string }[] = [
  { text: "🎉 First consultation FREE — Use code AWADH1ST", href: "/astrologers" },
  { text: "✨ 48,726+ Verified Ayodhya Pandits" },
  { text: "🔱 Live Pujas from Hanuman Garhi & Ram Ki Paidi" },
  { text: "⭐ Rated 4.8/5 by 9.5 Crore users" },
  { text: "🪔 Prasad delivered to your door" },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useLanguage();
  const { data: session } = useSession();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!session?.user) { setBalance(null); return; }
    fetch("/api/wallet").then((r) => r.json()).then((d) => setBalance(d.balanceINR ?? 0)).catch(() => setBalance(null));
  }, [session?.user]);

  const navItems = [
    { label: t.nav.seva, href: "/seva" },
    {
      label: t.nav.consultations,
      href: "/astrologers",
      dropdown: [
        { label: t.nav.chatWithAstrologer, href: "/astrologers" },
        { label: t.nav.callAstrologer, href: "/astrologers" },
        { label: t.nav.aiChat, href: "/chat" },
      ],
    },
    {
      label: t.nav.freeServices,
      href: "/kundali",
      dropdown: [
        { label: t.nav.freeKundali, href: "/kundali" },
        { label: t.nav.kundaliMatching, href: "/match" },
        { label: "Panchang Calendar", href: "/panchang" },
        { label: t.nav.aiChat, href: "/chat" },
      ],
    },
    {
      label: t.nav.horoscope,
      href: "/kundali",
      dropdown: [
        { label: t.nav.dailyHoroscope, href: "/kundali" },
        { label: "Panchang Calendar", href: "/panchang" },
      ],
    },
    { label: t.nav.plus, href: "/plus" },
  ];

  return (
    <>
      {/* Ticker */}
      <div className="promo-ticker" aria-label="Promotions">
        <div className="ticker-track">
          {[...tickerItems, ...tickerItems].map((tItem, i) => (
            <div key={i} className="ticker-item">
              {tItem.href ? <Link href={tItem.href} className="ticker-link">{tItem.text}</Link> : tItem.text}
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
                  {t.common.ayodhya}
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
            <LanguageSwitcher />
            <ThemeToggle />
            {session?.user ? (
              <>
                {balance !== null && <div className="header-balance">₹&nbsp;{balance.toLocaleString("en-IN")}</div>}
                <Link href="/account" className="header-avatar" aria-label="My Account">
                  {(session.user.name || session.user.phone || "U").replace(/^\+?91/, "")[0].toUpperCase()}
                </Link>
                <button
                  type="button"
                  className="header-signout"
                  aria-label="Sign out"
                  title="Sign out"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>
              </>
            ) : (
              <Link href="/login" className="btn btn-primary btn-sm">Sign In</Link>
            )}
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
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 16 }}>
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
            {session?.user ? (
              <>
                <Link href="/account" className="btn btn-primary btn-sm" style={{ marginTop: 16, width: "100%" }} onClick={() => setMobileOpen(false)}>
                  My Account {balance !== null && `· ₹${balance.toLocaleString("en-IN")}`}
                </Link>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{ marginTop: 10, width: "100%" }}
                  onClick={() => { setMobileOpen(false); signOut({ callbackUrl: "/" }); }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/login" className="btn btn-primary btn-sm" style={{ marginTop: 16, width: "100%" }} onClick={() => setMobileOpen(false)}>
                Sign In
              </Link>
            )}
          </div>
        )}
      </header>
    </>
  );
}
