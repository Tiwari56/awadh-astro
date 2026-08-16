"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import PromoModal from "@/components/ui/PromoModal";
import { useLanguage } from "@/lib/i18n/LanguageContext";

/* ── Static content datasets ──────────────────────
   These are illustrative marketing/demo content (astrologer bios, testimonials,
   horoscope copy). Translating this large a volume of prose per-locale is a
   content job, not a UI job — left English-only for this pass; the natural
   home for it is the admin panel mentioned for the next iteration. Everything
   structural around it (headings, labels, buttons) IS translated below. */
const zodiacSigns = [
  { name: "Aries",       hindi: "मेष",      icon: "♈", dates: "Mar 21 – Apr 19", lucky: "Red", num: 9 },
  { name: "Taurus",      hindi: "वृष",      icon: "♉", dates: "Apr 20 – May 20", lucky: "Green", num: 6 },
  { name: "Gemini",      hindi: "मिथुन",    icon: "♊", dates: "May 21 – Jun 20", lucky: "Yellow", num: 5 },
  { name: "Cancer",      hindi: "कर्क",     icon: "♋", dates: "Jun 21 – Jul 22", lucky: "White", num: 2 },
  { name: "Leo",         hindi: "सिंह",     icon: "♌", dates: "Jul 23 – Aug 22", lucky: "Gold", num: 1 },
  { name: "Virgo",       hindi: "कन्या",    icon: "♍", dates: "Aug 23 – Sep 22", lucky: "Brown", num: 5 },
  { name: "Libra",       hindi: "तुला",     icon: "♎", dates: "Sep 23 – Oct 22", lucky: "Blue", num: 6 },
  { name: "Scorpio",     hindi: "वृश्चिक",  icon: "♏", dates: "Oct 23 – Nov 21", lucky: "Maroon", num: 8 },
  { name: "Sagittarius", hindi: "धनु",      icon: "♐", dates: "Nov 22 – Dec 21", lucky: "Purple", num: 3 },
  { name: "Capricorn",   hindi: "मकर",      icon: "♑", dates: "Dec 22 – Jan 19", lucky: "Black", num: 8 },
  { name: "Aquarius",    hindi: "कुंभ",     icon: "♒", dates: "Jan 20 – Feb 18", lucky: "Violet", num: 4 },
  { name: "Pisces",      hindi: "मीन",      icon: "♓", dates: "Feb 19 – Mar 20", lucky: "Sea-green", num: 7 },
];

const horoscopeTexts = [
  "Today brings bold opportunities in career — act fast. A surprise message from someone close warms the heart.",
  "Financial caution is advised. A delay becomes a blessing in disguise. Love blossoms in an unexpected moment.",
  "Your communication skills shine. Collaborative projects hit a breakthrough. Evening brings deep personal clarity.",
  "Emotions run high — channel them creatively. A family matter finds peaceful resolution by day's end.",
  "Leadership instincts are heightened. Seize the spotlight. Romantic energy peaks; express your feelings today.",
  "Detail-oriented work yields big results. Health focus pays off. A mentor appears with game-changing advice.",
  "Balance is your superpower today. Relationships deepen beautifully. Creative ventures attract positive attention.",
  "Intensity brings transformation. A financial decision proves pivotal. Trust your intuition above all else.",
  "Adventure calls — embrace it. Philosophical conversations inspire new direction. Travel plans align with fortune.",
  "Discipline pays off handsomely. Career advancements are within reach. Family bonds are strengthened today.",
  "Innovation strikes in the afternoon. Community connections open unexpected doors. Stay open to the unusual.",
  "Intuition is at its peak. Spiritual clarity guides major decisions. Dreams tonight carry important messages.",
];

const astrologers = [
  { id: 1, name: "Pt. Ram Shankar Jha", initial: "RS", exp: "15 yrs", rating: 4.9, consults: 12400, rate: 19, specialties: ["Vedic", "Kundali", "Marriage"], status: "online" as const, lang: "Hindi, English" },
  { id: 2, name: "Dr. Vidya Mishra", initial: "VM", exp: "12 yrs", rating: 4.8, consults: 9800, rate: 32, specialties: ["Tarot", "Numerology", "Love"], status: "online" as const, lang: "Hindi, Urdu" },
  { id: 3, name: "Pt. Arvind Tripathi", initial: "AT", exp: "20 yrs", rating: 5.0, consults: 18200, rate: 45, specialties: ["Vastu", "Vedic", "Career"], status: "online" as const, lang: "Hindi, Sanskrit" },
  { id: 4, name: "Acharya Deepak", initial: "AD", exp: "10 yrs", rating: 4.7, consults: 7300, rate: 22, specialties: ["Love", "Finance", "Business"], status: "busy" as const, lang: "Hindi, English" },
  { id: 5, name: "Jyotishi Nirmala Devi", initial: "ND", exp: "8 yrs", rating: 4.6, consults: 5100, rate: 18, specialties: ["Palmistry", "Kundali"], status: "online" as const, lang: "Hindi, Bhojpuri" },
  { id: 6, name: "Pt. Arvind Sharma", initial: "AS", exp: "25 yrs", rating: 4.9, consults: 21000, rate: 60, specialties: ["Vedic", "Remedies", "Muhurat"], status: "online" as const, lang: "Hindi, Sanskrit" },
];

const services = [
  { icon: "🪔", title: "Free Kundali",      desc: "Detailed birth chart in seconds",       href: "/kundali" },
  { icon: "💑", title: "Kundali Matching",  desc: "Marriage compatibility report",          href: "/match" },
  { icon: "✨", title: "AI Astro Chat",     desc: "24×7 AI-powered guidance",              href: "/chat" },
  { icon: "🔱", title: "Online Puja",       desc: "Live rituals from Ayodhya temples",     href: "/seva" },
  { icon: "🔔", title: "Daily Horoscope",   desc: "Personalized daily predictions",         href: "/kundali" },
  { icon: "📿", title: "Awadh Plus",        desc: "Muhurat alerts & premium access",        href: "/plus" },
  { icon: "🧿", title: "Tarot Reading",     desc: "Unlock hidden truths with Tarot",       href: "/chat" },
  { icon: "🏠", title: "Vastu Shastra",     desc: "Harmonize your home & workspace",       href: "/astrologers" },
];

const pujas = [
  { id: 1, emoji: "🔱", title: "Rudrabhishek",       hindi: "रुद्राभिषेक",         temple: "Hanuman Garhi",    duration: "~2 hrs", price: "₹2,100", tag: "Most Booked", popular: true },
  { id: 2, emoji: "🌟", title: "Navagraha Shanti",   hindi: "नवग्रह शांति",        temple: "Nageshwarnath",    duration: "~3 hrs", price: "₹3,500", tag: "Prasad Courier", popular: false },
  { id: 3, emoji: "✿",  title: "Naamkaran Sanskar",  hindi: "नामकरण संस्कार",      temple: "Ram Ki Paidi",     duration: "~1.5 hrs", price: "₹1,800", tag: "Baby Milestone", popular: false },
];

const testimonials = [
  { name: "Priya S.",   city: "Lucknow",   rating: 5, text: "Pt. Ram Shankar gave me incredibly accurate career predictions. The reading was done with genuine care and deep astrological knowledge. Truly life-changing!" },
  { name: "Rahul M.",   city: "Delhi",     rating: 5, text: "The kundali matching for my wedding was spot on. Very professional — the whole process was smooth, trustworthy, and worth every rupee." },
  { name: "Sunita D.",  city: "Mumbai",    rating: 5, text: "I was skeptical at first but the AI chat actually read my chart perfectly! Highly recommend for anyone seeking quick and accurate answers." },
  { name: "Amit K.",    city: "Ayodhya",   rating: 5, text: "The online puja service is incredible. I watched Rudrabhishek live and the prasad arrived the very next morning. Jai Shri Ram! 🙏" },
  { name: "Meena P.",   city: "Varanasi",  rating: 5, text: "Dr. Vidya's tarot reading was truly insightful. She understood my situation perfectly without me saying a word. Absolutely amazing experience!" },
  { name: "Vikram R.",  city: "Kanpur",    rating: 5, text: "Been using Awadh Astro for 6 months. The muhurat alerts from Plus have genuinely improved my decision-making. Absolutely worth it!" },
  { name: "Anjali T.",  city: "Prayagraj", rating: 5, text: "The free kundali is more detailed than any paid service I've tried before. Planet positions were accurate to the degree. Outstanding quality!" },
  { name: "Deepak S.",  city: "Bhopal",    rating: 5, text: "I consulted about business timing and the advice was spot on. Got into a new venture exactly on the muhurat suggested and everything is going great." },
];

export default function HomePage() {
  const { t } = useLanguage();
  const h = t.home;
  const [activeZodiac, setActiveZodiac] = useState(4); // Leo default
  const [counters, setCounters] = useState({ a: 0, u: 0, c: 0, l: 0 });
  const [stars, setStars] = useState<{ id: number; top: number; left: number; size: number; delay: number; dur: number; op: number }[]>([]);

  useEffect(() => {
    // Generate stars only on the client to avoid hydration mismatch
    setStars(Array.from({ length: 50 }, (_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 2.5 + 0.8,
      delay: Math.random() * 6,
      dur: Math.random() * 4 + 3,
      op: Math.random() * 0.55 + 0.2,
    })));

    const targets = { a: 48726, u: 9500000, c: 50000000, l: 13 };
    const steps = 80;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const e = 1 - Math.pow(1 - step / steps, 3);
      setCounters({ a: Math.round(targets.a * e), u: Math.round(targets.u * e), c: Math.round(targets.c * e), l: Math.round(targets.l * e) });
      if (step >= steps) clearInterval(timer);
    }, 25);
    return () => clearInterval(timer);
  }, []);

  const fmt = (n: number) => {
    if (n >= 10000000) return (n / 10000000).toFixed(1) + "Cr+";
    if (n >= 100000)   return (n / 100000).toFixed(1) + "L+";
    if (n >= 1000)     return (n / 1000).toFixed(1) + "K+";
    return n + "+";
  };

  const z = zodiacSigns[activeZodiac];

  return (
    <div className="landing">
      {/* ── HERO ─────────────────────────────────── */}
      <section className="hero">
        <div className="hero-sunburst" aria-hidden="true" />

        <div className="hero-orbits" aria-hidden="true">
          <div className="orbit-ring orbit-ring-1"><div className="planet planet-1" /></div>
          <div className="orbit-ring orbit-ring-2"><div className="planet planet-2" /></div>
          <div className="orbit-ring orbit-ring-3"><div className="planet planet-3" /></div>
        </div>

        <div className="stars-container" aria-hidden="true">
          {stars.map((s) => (
            <div
              key={s.id}
              className="star"
              style={{
                top: `${s.top}%`, left: `${s.left}%`,
                width: s.size, height: s.size,
                "--dur": `${s.dur}s`,
                "--delay": `${s.delay}s`,
                "--op": s.op,
              } as React.CSSProperties}
            />
          ))}
        </div>

        <div className="hero-content-wrap" style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 2 }}>
          <div className="hero-eyebrow" role="status">
            <span className="live-dot" aria-hidden="true" />
            {h.heroEyebrow}
          </div>
          <p className="hero-hindi">{h.heroHindiLine}</p>
          <h1>
            <span className="grad-text-light">{h.heroTitleLine1}</span> {h.heroTitleLine2}
          </h1>
          <p className="hero-tagline">{h.heroTagline}</p>
          <div className="hero-actions">
            <Link href="/kundali" className="btn btn-primary" style={{ fontSize: "1rem" }}>
              🪔 {h.ctaFreeKundali}
            </Link>
            <Link href="/astrologers" className="btn btn-outline">
              💬 {h.ctaChatAstrologer}
            </Link>
          </div>
          <div className="hero-stats">
            {[
              { v: "48,726+", l: h.statAstrologers },
              { v: "9.5Cr+",  l: h.statUsers },
              { v: "5Cr+",    l: h.statConsultations },
              { v: "4.8 ★",   l: h.statRating },
            ].map((s) => (
              <div key={s.l} className="hero-stat-item">
                <div className="hero-stat-num">{s.v}</div>
                <div className="hero-stat-label">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ──────────────────────────── */}
      <div className="trust-strip">
        {[
          { icon: "✓", label: h.trustVerified },
          { icon: "📹", label: h.trustLive },
          { icon: "📦", label: h.trustPrasad },
          { icon: "🔒", label: h.trustSecure },
          { icon: "🌐", label: h.trustLanguages },
        ].map((ti) => (
          <div key={ti.label} className="trust-item">
            <span className="trust-item-icon">{ti.icon}</span>
            <span>{ti.label}</span>
          </div>
        ))}
      </div>

      {/* ── ZODIAC / HOROSCOPE ────────────────────── */}
      <section className="zodiac-section">
        <div className="container">
          <span className="section-eyebrow section-eyebrow-light">{h.zodiacEyebrow}</span>
          <h2 className="section-title" style={{ marginBottom: "6px" }}>{h.zodiacTitle}</h2>
          <p className="section-sub" style={{ marginBottom: "28px" }}>{h.zodiacSub}</p>

          <div className="zodiac-scroll">
            {zodiacSigns.map((zs, i) => (
              <button
                key={zs.name}
                className={`zodiac-card${activeZodiac === i ? " active" : ""}`}
                onClick={() => setActiveZodiac(i)}
                aria-label={`${zs.name} horoscope`}
              >
                <div className="zodiac-icon">{zs.icon}</div>
                <div className="zodiac-name">{zs.name}</div>
                <div className="zodiac-dates">{zs.dates}</div>
              </button>
            ))}
          </div>

          <div className="horoscope-preview" key={activeZodiac}>
            <div className="horoscope-sign-icon" style={{ animation: "popIn 0.3s ease both" }}>{z.icon}</div>
            <div className="horoscope-body">
              <div className="horoscope-name">{z.name}</div>
              <div className="horoscope-hindi">{z.hindi}</div>
              <p className="horoscope-text">{horoscopeTexts[activeZodiac]}</p>
              <div className="horoscope-lucky">
                <div className="lucky-item">🎨 {h.luckyColor}: {z.lucky}</div>
                <div className="lucky-item">🔢 {h.luckyNumber}: {z.num}</div>
                <div className="lucky-item">⭐ {h.energy}: High</div>
              </div>
              <Link href="/kundali" style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "var(--gold)", fontSize: "0.82rem", fontWeight: 700 }}>
                {h.readFull} →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────── */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {[
              { n: fmt(counters.a), l: h.statAstrologersLabel },
              { n: fmt(counters.u), l: h.statUsersLabel },
              { n: fmt(counters.c), l: h.statConsultationsLabel },
              { n: `${counters.l}+`, l: h.statLanguagesLabel },
            ].map((s) => (
              <div key={s.l} className="stat-item">
                <span className="stat-number">{s.n}</span>
                <div className="stat-label">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE ASTROLOGERS ─────────────────────── */}
      <section className="astro-section">
        <div className="container">
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
            <div>
              <span className="section-eyebrow">
                <span style={{ color: "var(--green)" }}>● </span>{h.astroEyebrow}
              </span>
              <h2 className="section-title" style={{ marginBottom: 0 }}>{h.astroTitle}</h2>
            </div>
            <Link href="/astrologers" style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--saffron)" }}>
              {h.viewAll} →
            </Link>
          </div>
          <p className="section-sub">{h.astroSub}</p>

          <div className="astro-grid">
            {astrologers.map((a) => (
              <div key={a.id} className="astro-card">
                <div className="astro-top">
                  <div style={{ position: "relative" }}>
                    <div className="avatar">
                      {a.initial}
                      <div className="avatar-ring" />
                    </div>
                    <div
                      className={`status-badge status-${a.status}`}
                      style={{ position: "absolute", bottom: 2, right: 2, width: 13, height: 13, border: "2px solid #1a0f08", borderRadius: "50%" }}
                    />
                  </div>
                  <div>
                    <div className="astro-name">{a.name}</div>
                    <div className="verified">✔ Ayodhya Verified</div>
                    <div className="astro-rating">⭐ {a.rating} · {a.exp} · {a.lang}</div>
                  </div>
                </div>

                <div className="astro-tags">
                  {a.specialties.map((s) => <span key={s} className="tag">{s}</span>)}
                </div>

                <div className="astro-meta">{a.consults.toLocaleString("en-IN")} consultations</div>

                <div className="astro-actions">
                  <button className="btn btn-chat btn-sm" style={{ flex: 1 }} disabled={a.status !== "online"}>
                    💬 {h.chatBtn}
                  </button>
                  <button className="btn btn-call btn-sm" style={{ flex: 1 }} disabled={a.status !== "online"}>
                    📞 {h.callBtn}
                  </button>
                </div>

                <div className="astro-footer">
                  <span className="rate">₹{a.rate}<small>/min</small></span>
                  {a.status === "busy" && (
                    <span style={{ fontSize: "0.72rem", color: "#f59e0b", fontWeight: 700 }}>● Busy</span>
                  )}
                  {a.status === "online" && (
                    <span style={{ fontSize: "0.72rem", color: "var(--green)", fontWeight: 700 }}>● Online</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "32px" }}>
            <Link href="/astrologers" className="btn btn-outline" style={{ display: "inline-flex" }}>
              {h.seeAllAstrologers}
            </Link>
          </div>
        </div>
      </section>

      {/* ── SERVICES ─────────────────────────────── */}
      <section className="services-section">
        <div className="container">
          <span className="section-eyebrow" style={{ color: "var(--saffron-dark)" }}>{h.servicesEyebrow}</span>
          <h2 className="section-title section-title-dark" style={{ marginBottom: "6px" }}>{h.servicesTitle}</h2>
          <p className="section-sub section-sub-dark">{h.servicesSub}</p>
          <div className="services-grid">
            {services.map((s) => (
              <Link key={s.title} href={s.href} className="service-card">
                <div className="service-icon">{s.icon}</div>
                <div>
                  <div className="service-title">{s.title}</div>
                  <div className="service-desc">{s.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── PUJA ─────────────────────────────────── */}
      <section className="puja-section">
        <div className="container">
          <span className="section-eyebrow" style={{ color: "var(--terracotta)" }}>{h.pujaEyebrow}</span>
          <h2 className="section-title section-title-dark" style={{ marginBottom: "6px" }}>{h.pujaTitle}</h2>
          <p className="section-sub section-sub-dark">{h.pujaSub}</p>
          <div className="puja-grid">
            {pujas.map((p) => (
              <div key={p.id} className="puja-card">
                <div className="puja-image">
                  {p.popular && <span className="puja-badge">☆ {p.tag}</span>}
                  <span>{p.emoji}</span>
                </div>
                <div className="puja-body">
                  <div className="puja-name">{p.title}</div>
                  <div className="puja-hindi">{p.hindi}</div>
                  <div className="puja-temple">
                    <span>⌂</span> {p.temple} · {p.duration}
                  </div>
                  <div className="puja-footer">
                    <div className="puja-price">{p.price} <small>{h.onwards}</small></div>
                    <Link href="/seva" className="btn btn-sm" style={{ background: "var(--terracotta)", color: "#fff", borderRadius: "999px" }}>
                      {h.bookNow}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT / CONTACT ──────────────────────── */}
      <section className="about-section" id="about">
        <div className="container">
          <span className="section-eyebrow" style={{ color: "var(--saffron-dark)" }}>{h.aboutEyebrow}</span>
          <h2 className="section-title section-title-dark" style={{ marginBottom: "6px" }}>{h.aboutTitle}</h2>
          <p className="section-sub section-sub-dark">{h.aboutSub}</p>

          <div className="about-grid">
            <div className="card about-card">
              <h3>{h.ourStory}</h3>
              <p style={{ marginBottom: 14 }}>{h.storyText}</p>
              <ul>
                <li>Free, instant kundali generation from real birth-chart data</li>
                <li>Live consultations with verified Ayodhya pandits, by chat or call</li>
                <li>Pujas performed in real Ayodhya temples, streamed live, prasad couriered to you</li>
                <li>AI-assisted guidance available 24×7, grounded in your actual chart</li>
              </ul>
            </div>

            <div className="card about-card">
              <h3>{h.contactTitle}</h3>
              <div className="contact-row">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z" /><path d="m4 6 8 7 8-7" /></svg>
                <a href="mailto:support@awadhastro.com">support@awadhastro.com</a>
              </div>
              <div className="contact-row">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2Z" /></svg>
                <a href="tel:+911234567890">+91 12345 67890</a>
              </div>
              <div className="contact-row">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                <span>Ram Path, Ayodhya, Uttar Pradesh 224123</span>
              </div>
              <div className="contact-row">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
                <span>{h.supportHours}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────── */}
      <section className="testimonials-section">
        <div className="container" style={{ marginBottom: "36px" }}>
          <span className="section-eyebrow section-eyebrow-light">{h.testimonialsEyebrow}</span>
          <h2 className="section-title" style={{ marginBottom: "6px" }}>{h.testimonialsTitle}</h2>
          <p className="section-sub">{h.testimonialsSub}</p>
        </div>
        <div style={{ overflow: "hidden" }}>
          <div className="testimonials-track">
            {[...testimonials, ...testimonials].map((tm, i) => (
              <div key={i} className="testimonial-card">
                <div className="testimonial-stars">{"★".repeat(tm.rating)}</div>
                <p className="testimonial-text">&quot;{tm.text}&quot;</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{tm.name[0]}</div>
                  <div>
                    <div className="testimonial-name">{tm.name}</div>
                    <div className="testimonial-city">{tm.city}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── APP DOWNLOAD ─────────────────────────── */}
      <section className="app-section">
        <div className="bottom-orbits" aria-hidden="true">
          <div className="orbit-ring orbit-ring-4"><div className="planet planet-4"><img src="/planets/gold.jpg" alt="Gold Planet" /></div></div>
          <div className="orbit-ring orbit-ring-5"><div className="planet planet-5"><img src="/planets/purple.jpg" alt="Purple Planet" /></div></div>
          <div className="orbit-ring orbit-ring-6"><div className="planet planet-6"><img src="/planets/ice.jpg" alt="Ice Planet" /></div></div>
          <div className="orbit-ring orbit-ring-7"><div className="planet planet-7"><img src="/planets/yellow_white.jpg" alt="Yellow White Planet" /></div></div>
        </div>
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <span className="section-eyebrow section-eyebrow-light">{h.appEyebrow}</span>
          <h2 className="section-title" style={{ marginBottom: "12px" }}>{h.appTitle}</h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.95rem", maxWidth: 500, margin: "0 auto" }}>{h.appSub}</p>
          <div className="app-badges">
            <a href="#" className="app-badge">
              <span className="app-badge-icon">🍎</span>
              <div className="app-badge-text">
                <small>Download on the</small>
                <strong>App Store</strong>
              </div>
            </a>
            <a href="#" className="app-badge">
              <span className="app-badge-icon">▶</span>
              <div className="app-badge-text">
                <small>Get it on</small>
                <strong>Google Play</strong>
              </div>
            </a>
          </div>
        </div>
      </section>
      <PromoModal />
    </div>
  );
}
