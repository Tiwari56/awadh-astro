import Link from "next/link";

const features = [
  {
    title: "🛕 Puja in Ayodhya, in Your Name",
    text: "Can't travel to Ayodhya? A verified pandit performs your Rudrabhishek, Navagraha Shanti or Naamkaran in a real Ayodhya temple — streamed live, with prasad couriered worldwide.",
    href: "/seva",
  },
  {
    title: "🪔 Free Kundali in Seconds",
    text: "Enter your birth details and instantly see your rashi, nakshatra, panchang, dashas, dosha checks, and full planetary positions — in Hindi and English.",
    href: "/kundali",
  },
  {
    title: "💑 Kundali Matching for Marriage",
    text: "Ashtakoot Guna Milan — the 36-point Vedic compatibility check. See the koota breakdown, Mangal Dosha status, and remedies before fixing a match.",
    href: "/match",
  },
  {
    title: "🙏 Ayodhya-Verified Astrologers",
    text: "Chat or call credentialed pandits from the land of Shri Ram. See who is online right now and connect per-minute.",
    href: "/astrologers",
  },
  {
    title: "✨ AI Astro Chat, 24×7",
    text: "Ask anything, anytime. Our AI reads your real computed chart — accurate positions, instant answers, a fraction of the cost.",
    href: "/chat",
  },
  {
    title: "🔔 Awadh Plus Alerts",
    text: "Personalized muhurat notifications: good days to buy or invest, caution days to avoid, Rahu Kaal and Sade Sati warnings.",
    href: "/plus",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <span className="hero-eyebrow">
          <span className="live" aria-hidden="true" />
          Ayodhya-Verified Astrologers · Online Now
        </span>
        <h1>
          Astrology from the
          <br />
          Land of Shri Ram
        </h1>
        <p className="tagline">
          Awadh Astro brings Ayodhya&apos;s trusted astrological wisdom to your phone — free
          kundali, live consultations, AI guidance, and personalized auspicious-day alerts.
        </p>
        <div className="hero-actions">
          <Link href="/kundali" className="btn btn-primary">
            Get My Free Kundali
          </Link>
          <Link href="/astrologers" className="btn btn-outline">
            Talk to an Astrologer
          </Link>
        </div>
      </section>

      <section className="section container">
        <div className="grid grid-2">
          {features.map((f) => (
            <Link key={f.href} href={f.href} className="card feature-card">
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
