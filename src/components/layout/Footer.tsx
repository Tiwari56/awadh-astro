"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="site-footer">
      <div className="footer-logo">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "8px" }}>
          <div style={{
            width: 36, height: 36, borderRadius: "10px",
            background: "linear-gradient(135deg, var(--gold-bright), var(--gold-deep))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.2rem", color: "#231206", boxShadow: "var(--shadow-glow)"
          }}>ॐ</div>
          <span style={{
            fontFamily: "var(--font-display-stack)", fontSize: "1.2rem", fontWeight: 700,
            letterSpacing: "0.02em", color: "var(--ink)"
          }}>
            AWADH <span style={{ color: "var(--gold)" }}>ASTRO</span>
          </span>
        </div>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem" }}>
          {t.footer.tagline}
        </p>
      </div>

      <div className="footer-links">
        {[
          { href: "/seva",        label: t.nav.seva },
          { href: "/kundali",     label: t.nav.freeKundali },
          { href: "/match",       label: t.nav.kundaliMatching },
          { href: "/astrologers", label: t.nav.consultations },
          { href: "/chat",        label: t.nav.aiChat },
          { href: "/plus",        label: t.nav.plus },
          { href: "/#about",      label: "About" },
        ].map((l) => (
          <Link key={l.href} href={l.href}>{l.label}</Link>
        ))}
      </div>

      <div className="footer-contact">
        <a href="mailto:support@awadhastro.com">support@awadhastro.com</a>
        <span aria-hidden="true">·</span>
        <a href="tel:+911234567890">+91 12345 67890</a>
        <span aria-hidden="true">·</span>
        <span>Ram Path, Ayodhya, Uttar Pradesh 224123</span>
      </div>

      <div className="footer-social" aria-label="Follow us">
        {[
          { label: "Instagram", href: "#", d: "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm5 5.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Zm5.6-.9a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0Z" },
          { label: "YouTube", href: "#", d: "M21.6 7.2a3 3 0 0 0-2.1-2.1C17.7 4.6 12 4.6 12 4.6s-5.7 0-7.5.5a3 3 0 0 0-2.1 2.1C2 9 2 12 2 12s0 3 .4 4.8a3 3 0 0 0 2.1 2.1c1.8.5 7.5.5 7.5.5s5.7 0 7.5-.5a3 3 0 0 0 2.1-2.1C22 15 22 12 22 12s0-3-.4-4.8ZM10 15.5v-7l6 3.5-6 3.5Z" },
          { label: "WhatsApp", href: "#", d: "M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm0 18.2a8.1 8.1 0 0 1-4.1-1.1l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.1-.3.2-.5.1a6.7 6.7 0 0 1-2-1.2 7.4 7.4 0 0 1-1.4-1.7c-.1-.2 0-.4.1-.5l.4-.4c.1-.1.1-.3.2-.4a.4.4 0 0 0 0-.4c-.1-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2c0 1.3.9 2.6 1.1 2.8.1.2 2 3 4.7 4.2a12.7 12.7 0 0 0 1.7.6 4 4 0 0 0 1.8.1c.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2-.1-.1-.2-.2-.4-.3Z" },
        ].map((s) => (
          <a key={s.label} href={s.href} aria-label={s.label} title={s.label}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d={s.d} /></svg>
          </a>
        ))}
      </div>

      <p style={{ marginBottom: 6 }}>{t.footer.disclaimer}</p>
      <p style={{ color: "rgba(255,255,255,0.18)" }}>
        © {new Date().getFullYear()} Awadh Astro. {t.footer.rights}
      </p>
    </footer>
  );
}
