import Link from "next/link";

export default function Footer() {
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
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.75rem" }}>
          Ayodhya, Uttar Pradesh · India&apos;s sacred astrology platform
        </p>
      </div>

      <div className="footer-links">
        {[
          { href: "/kundali",     label: "Free Kundali" },
          { href: "/astrologers", label: "Astrologers" },
          { href: "/chat",        label: "AI Chat" },
          { href: "/plus",        label: "Awadh Plus" },
        ].map((l) => (
          <Link key={l.href} href={l.href}>{l.label}</Link>
        ))}
      </div>

      <p style={{ marginBottom: 6 }}>
        Guidance is for informational and spiritual purposes only — not a substitute for medical, legal, or financial advice.
      </p>
      <p style={{ color: "rgba(255,255,255,0.18)" }}>
        © {new Date().getFullYear()} Awadh Astro. All rights reserved.
      </p>
    </footer>
  );
}
