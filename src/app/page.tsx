"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

/* ── Static data ──────────────────────────────── */
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
  { icon: "🪔", title: "Free Kundali",      desc: "Detailed birth chart in seconds",       href: "/kundali",      bg: "#fef8e8" },
  { icon: "💑", title: "Kundali Matching",  desc: "Marriage compatibility report",          href: "/kundali",      bg: "#fce8f0" },
  { icon: "✨", title: "AI Astro Chat",     desc: "24×7 AI-powered guidance",              href: "/chat",         bg: "#e8f0fe" },
  { icon: "🔱", title: "Online Puja",       desc: "Live rituals from Ayodhya temples",     href: "/",             bg: "#fde8d8" },
  { icon: "🔔", title: "Daily Horoscope",   desc: "Personalized daily predictions",         href: "/kundali",      bg: "#e8fef0" },
  { icon: "📿", title: "Awadh Plus",        desc: "Muhurat alerts & premium access",        href: "/plus",         bg: "#f5e8ff" },
  { icon: "🧿", title: "Tarot Reading",     desc: "Unlock hidden truths with Tarot",       href: "/chat",         bg: "#e8f8ff" },
  { icon: "🏠", title: "Vastu Shastra",     desc: "Harmonize your home & workspace",       href: "/astrologers",  bg: "#fff8e8" },
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
  const [activeZodiac, setActiveZodiac] = useState(4); // Leo default
  const [counters, setCounters] = useState({ a: 0, u: 0, c: 0, l: 0 });
  const [stars, setStars] = useState<{ id: number; top: number; left: number; size: number; delay: number; dur: number; op: number }[]>([]);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoShownCount, setPromoShownCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setPromoShownCount(prev => {
          if (prev === 0) {
            setShowPromoModal(true);
            return 1;
          }
          return prev;
        });
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!showPromoModal && promoShownCount > 0 && promoShownCount < 3) {
      const timer = setTimeout(() => {
        setShowPromoModal(true);
        setPromoShownCount(prev => prev + 1);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [showPromoModal, promoShownCount]);

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
    <>
      {/* ── HERO ─────────────────────────────────── */}
      <section className="hero">
        {/* Background layers */}
        <div className="hero-sunburst" aria-hidden="true" />
        
        {/* Revolving Planets */}
        <div className="hero-orbits" aria-hidden="true">
          <div className="orbit-ring orbit-ring-1">
             <div className="planet planet-1" />
          </div>
          <div className="orbit-ring orbit-ring-2">
             <div className="planet planet-2" />
          </div>
          <div className="orbit-ring orbit-ring-3">
             <div className="planet planet-3" />
          </div>
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

        {/* Content */}
        <div className="hero-content-wrap" style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 2 }}>
          <div className="hero-eyebrow" role="status">
            <span className="live-dot" aria-hidden="true" />
            Ayodhya-Verified Astrologers · Online Now
          </div>
          <p className="hero-hindi">श्री राम की नगरी से — ज्योतिष की सेवा</p>
          <h1>
            <span className="grad-text-light">Sacred Wisdom</span> from the<br />
            Land of Shri Ram
          </h1>
          <p className="hero-tagline">
            India's most trusted Ayodhya astrology platform — free kundali, live consultations
            with verified pandits, AI guidance, and auspicious-day alerts.
          </p>
          <div className="hero-actions">
            <Link href="/kundali" className="btn btn-primary" style={{ fontSize: "1rem" }}>
              🪔 Get My Free Kundali
            </Link>
            <Link href="/astrologers" className="btn btn-outline">
              💬 Chat with Astrologer
            </Link>
          </div>
          <div className="hero-stats">
            {[
              { v: "48,726+", l: "Astrologers" },
              { v: "9.5Cr+",  l: "Happy Users" },
              { v: "5Cr+",    l: "Consultations" },
              { v: "4.8 ★",   l: "App Rating" },
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
          { icon: "✓", label: "Ayodhya-verified pandits" },
          { icon: "📹", label: "Watch rituals live" },
          { icon: "📦", label: "Prasad to your door" },
          { icon: "🔒", label: "100% secure payments" },
          { icon: "🌐", label: "13 languages" },
        ].map((t) => (
          <div key={t.label} className="trust-item">
            <span style={{ fontSize: "1.1rem" }}>{t.icon}</span>
            <span>{t.label}</span>
          </div>
        ))}
      </div>

      {/* ── ZODIAC / HOROSCOPE ────────────────────── */}
      <section className="zodiac-section">
        <div className="container">
          <span className="section-eyebrow section-eyebrow-light">Daily Horoscope</span>
          <h2 className="section-title" style={{ marginBottom: "6px" }}>What do the stars say today?</h2>
          <p className="section-sub" style={{ marginBottom: "28px" }}>Click your sign to see your personalized reading.</p>

          <div className="zodiac-scroll">
            {zodiacSigns.map((z, i) => (
              <button
                key={z.name}
                className={`zodiac-card${activeZodiac === i ? " active" : ""}`}
                onClick={() => setActiveZodiac(i)}
                aria-label={`${z.name} horoscope`}
              >
                <div className="zodiac-icon">{z.icon}</div>
                <div className="zodiac-name">{z.name}</div>
                <div className="zodiac-dates">{z.dates}</div>
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
                <div className="lucky-item">🎨 Lucky Color: {z.lucky}</div>
                <div className="lucky-item">🔢 Lucky Number: {z.num}</div>
                <div className="lucky-item">⭐ Energy: High</div>
              </div>
              <Link href="/kundali" style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "var(--gold)", fontSize: "0.82rem", fontWeight: 700 }}>
                Read full horoscope →
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
              { n: fmt(counters.a), l: "Verified Astrologers" },
              { n: fmt(counters.u), l: "Happy Users" },
              { n: fmt(counters.c), l: "Consultations Done" },
              { n: `${counters.l}+`, l: "Languages Supported" },
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
                <span style={{ color: "var(--green)" }}>● </span>Live Now
              </span>
              <h2 className="section-title" style={{ marginBottom: 0 }}>Talk to Astrologers</h2>
            </div>
            <Link href="/astrologers" style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--saffron)" }}>
              View all →
            </Link>
          </div>
          <p className="section-sub">Verified Ayodhya pandits available right now. First minute free for new users.</p>

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
                    💬 Chat
                  </button>
                  <button className="btn btn-call btn-sm" style={{ flex: 1 }} disabled={a.status !== "online"}>
                    📞 Call
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
              See all {48726}+ Astrologers
            </Link>
          </div>
        </div>
      </section>

      {/* ── SERVICES ─────────────────────────────── */}
      <section className="services-section">
        <div className="container">
          <span className="section-eyebrow" style={{ color: "var(--saffron-dark)" }}>Free & Premium</span>
          <h2 className="section-title section-title-dark" style={{ marginBottom: "6px" }}>Everything on One Platform</h2>
          <p className="section-sub section-sub-dark">Astrology, rituals, AI, and divine guidance — all in one sacred place.</p>
          <div className="services-grid">
            {services.map((s) => (
              <Link key={s.title} href={s.href} className="service-card">
                <div className="service-icon" style={{ background: s.bg }}>{s.icon}</div>
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
          <span className="section-eyebrow" style={{ color: "var(--terracotta)" }}>Live from Ayodhya</span>
          <h2 className="section-title section-title-dark" style={{ marginBottom: "6px" }}>🔱 Online Pujas</h2>
          <p className="section-sub section-sub-dark">
            A verified pandit performs your ritual live in a real Ayodhya temple. You watch on video. Prasad reaches home.
          </p>
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
                    <div className="puja-price">{p.price} <small>onwards</small></div>
                    <button className="btn btn-sm" style={{ background: "var(--terracotta)", color: "#fff", borderRadius: "999px" }}>
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────── */}
      <section className="testimonials-section">
        <div className="container" style={{ marginBottom: "36px" }}>
          <span className="section-eyebrow section-eyebrow-light">User Reviews</span>
          <h2 className="section-title" style={{ marginBottom: "6px" }}>Trusted by Millions</h2>
          <p className="section-sub">Real people, real transformations — guided by Ayodhya's sacred wisdom.</p>
        </div>
        <div style={{ overflow: "hidden" }}>
          <div className="testimonials-track">
            {[...testimonials, ...testimonials].map((t, i) => (
              <div key={i} className="testimonial-card">
                <div className="testimonial-stars">{"★".repeat(t.rating)}</div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.name[0]}</div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-city">{t.city}</div>
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
          <div className="orbit-ring orbit-ring-4">
             <div className="planet planet-4">
               <img src="/planets/gold.jpg" alt="Gold Planet" />
             </div>
          </div>
          <div className="orbit-ring orbit-ring-5">
             <div className="planet planet-5">
               <img src="/planets/purple.jpg" alt="Purple Planet" />
             </div>
          </div>
          <div className="orbit-ring orbit-ring-6">
             <div className="planet planet-6">
               <img src="/planets/ice.jpg" alt="Ice Planet" />
             </div>
          </div>
          <div className="orbit-ring orbit-ring-7">
             <div className="planet planet-7">
               <img src="/planets/yellow_white.jpg" alt="Yellow White Planet" />
             </div>
          </div>
        </div>
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <span className="section-eyebrow section-eyebrow-light">Download the App</span>
          <h2 className="section-title" style={{ marginBottom: "12px" }}>
            Take Ayodhya's Wisdom Everywhere
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.95rem", maxWidth: 500, margin: "0 auto" }}>
            Free consultations, live pujas, and daily guidance at your fingertips. 10 million+ downloads.
          </p>
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
      {/* ── PROMO MODAL ─────────────────────────── */}
      {showPromoModal && (
        <div className="promo-modal-overlay" onClick={() => setShowPromoModal(false)}>
          <div className="promo-modal" onClick={(e) => e.stopPropagation()}>
            <button className="promo-modal-close" onClick={() => setShowPromoModal(false)}>✕</button>
            <div className="promo-modal-image">
              <img src="/images/promo.jpg" alt="Get first consultation free" />
            </div>
            <div className="promo-modal-content">
              <h3>Get First Consultation</h3>
              <div className="promo-free-text">FREE</div>
              <button className="btn btn-consult" onClick={() => setShowPromoModal(false)}>CONSULT NOW</button>
              <p className="promo-disclaimer">* Valid for first consultation</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
