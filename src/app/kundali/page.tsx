"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import PlaceAutocomplete from "@/components/ui/PlaceAutocomplete";
import NorthIndianChart from "@/components/ui/NorthIndianChart";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { vedic } from "@/lib/i18n/vedic-terms";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { BirthDetails, DoshaSummary, KundaliResult, PlanetPosition } from "@/types";

type DoshaKind = "mangal" | "sadeSati" | "kaalSarp";

/**
 * The paragraph a dosha card shows. In Hindi this deliberately does NOT
 * translate dosha.summary — Prokerala's free-text description/remedy fields
 * stay English regardless of the `language` request param (verified live),
 * so a literal translation would still embed English fragments mid-sentence.
 * The Hindi builders in vedic-terms.ts convey the same meaning from the
 * dosha's present/severity fields instead, which we fully control.
 */
function doshaText(kind: DoshaKind, dosha: DoshaSummary, hi: boolean): string {
  if (!hi) return dosha.summary;
  if (kind === "mangal") return vedic.mangalDosha(dosha.present, dosha.severity);
  if (kind === "kaalSarp") return vedic.kaalSarp(dosha.present);
  return vedic.sadeSati(dosha.present, dosha.severity, dosha.summary);
}

function DoshaCard({ title, dosha, kind, hi, t }: { title: string; dosha: DoshaSummary; kind: DoshaKind; hi: boolean; t: Dictionary["kundali"] }) {
  return (
    <div className="card dosha-card">
      <div className="dosha-head">
        <span className="dosha-title">{title}</span>
        <span className={`badge ${dosha.present ? "badge-warn" : "badge-ok"}`}>
          {dosha.present ? `${t.present} · ${hi ? vedic.severity(dosha.severity) : dosha.severity}` : t.clear}
        </span>
      </div>
      <p>{doshaText(kind, dosha, hi)}</p>
    </div>
  );
}

/** Maps a present dosha to the Seva puja that traditionally addresses it. */
const REMEDY_MAP: Record<string, { pujaId: string; title: string; titleHi: string; reason: string; reasonHi: string }> = {
  mangal: {
    pujaId: "mangal-dosha-nivaran", title: "Mangal Dosha Nivaran", titleHi: "मंगल दोष निवारण",
    reason: "Traditionally performed before marriage to pacify Mars.",
    reasonHi: "विवाह से पूर्व मंगल को शांत करने के लिए परंपरागत रूप से की जाती है।",
  },
  sadeSati: {
    pujaId: "navagraha-shanti", title: "Navagraha Shanti", titleHi: "नवग्रह शांति",
    reason: "Pacifies Saturn's transit during the Sade Sati phase.",
    reasonHi: "साढ़े साती के दौरान शनि के गोचर को शांत करने हेतु।",
  },
  kaalSarp: {
    pujaId: "navagraha-shanti", title: "Navagraha Shanti", titleHi: "नवग्रह शांति",
    reason: "A broad planetary-pacification remedy used for Kaal Sarp effects.",
    reasonHi: "काल सर्प दोष के प्रभाव को शांत करने का व्यापक ग्रह-शांति उपाय।",
  },
};

function RemedyCta({ dosha, remedyKey, hi, t }: { dosha: DoshaSummary; remedyKey: keyof typeof REMEDY_MAP; hi: boolean; t: Dictionary["kundali"] }) {
  if (!dosha.present) return null;
  const remedy = REMEDY_MAP[remedyKey];
  return (
    <div className="remedy-cta">
      <span className="rc-ic" aria-hidden="true">🛕</span>
      <span className="rc-t">
        <b>{t.suggestedRemedy}: {hi ? remedy.titleHi : remedy.title}</b>
        {hi ? remedy.reasonHi : remedy.reason}
      </span>
      <a href={`/seva?puja=${remedy.pujaId}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">{t.book}</a>
    </div>
  );
}

const HOROSCOPE_TIMES = ["6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "8:00 PM", "9:00 PM"];

/**
 * Email-the-report + schedule-daily-horoscope actions, both delivered via
 * the real email provider (Brevo) through the existing send paths — no new
 * delivery mechanism, just surfaced where someone actually wants them
 * instead of buried inside a chat upsell card.
 */
function ReportDelivery({
  hi, name, birthLine, result, defaultEmail,
}: {
  hi: boolean; name: string; birthLine: string; result: KundaliResult | null; defaultEmail: string;
}) {
  const [reportEmail, setReportEmail] = useState(defaultEmail);
  const [reportStatus, setReportStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [reportError, setReportError] = useState<string | null>(null);

  const [scheduleEmail, setScheduleEmail] = useState(defaultEmail);
  const [scheduleTime, setScheduleTime] = useState(HOROSCOPE_TIMES[1]);
  const [scheduleStatus, setScheduleStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function sendReport(e: FormEvent) {
    e.preventDefault();
    if (!result) return;
    setReportStatus("sending");
    setReportError(null);
    try {
      const res = await fetch("/api/kundali/email-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: reportEmail, name, birthLine, result, locale: hi ? "hi" : "en" }),
      });
      const data = await res.json();
      if (!res.ok) { setReportError(data.error ?? "Could not send"); setReportStatus("error"); return; }
      setReportStatus("sent");
    } catch {
      setReportStatus("error");
    }
  }

  async function schedule(e: FormEvent) {
    e.preventDefault();
    setScheduleStatus("sending");
    try {
      const res = await fetch("/api/email/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: scheduleEmail, preferredTime: scheduleTime, name }),
      });
      setScheduleStatus(res.ok ? "sent" : "error");
    } catch {
      setScheduleStatus("error");
    }
  }

  return (
    <div className="report-delivery">
      <form className="card-v2 report-action" onSubmit={sendReport}>
        <h4>📧 {hi ? "यह रिपोर्ट ईमेल करें" : "Email me this report"}</h4>
        <p className="report-action-desc">
          {hi ? "मुख्य बिंदुओं का सारांश तुरंत आपके इनबॉक्स में भेजें।" : "Sends a summary of the key points straight to your inbox."}
        </p>
        {reportStatus === "sent" ? (
          <p className="city-note ok">✅ {hi ? "भेज दिया गया — अपना इनबॉक्स जांचें।" : "Sent — check your inbox."}</p>
        ) : (
          <>
            <div className="report-action-row">
              <input type="email" required className="input-v2" placeholder="you@example.com"
                value={reportEmail} onChange={(e) => setReportEmail(e.target.value)} />
              <button className="btn btn-primary btn-sm" type="submit" disabled={reportStatus === "sending" || !result}>
                {reportStatus === "sending" ? "…" : hi ? "भेजें" : "Send"}
              </button>
            </div>
            {reportError && <p className="city-note warn">{reportError}</p>}
          </>
        )}
      </form>

      <form className="card-v2 report-action" onSubmit={schedule}>
        <h4>🔔 {hi ? "दैनिक राशिफल शेड्यूल करें" : "Schedule my daily horoscope"}</h4>
        <p className="report-action-desc">
          {hi ? "हर दिन चुने हुए समय पर आपका राशिफल आपके ईमेल पर पहुंचेगा।" : "Get your horoscope delivered to your inbox at the same time every day."}
        </p>
        {scheduleStatus === "sent" ? (
          <p className="city-note ok">✅ {hi ? "शेड्यूल हो गया — पुष्टि के लिए इनबॉक्स जांचें।" : "Scheduled — check your inbox to confirm."}</p>
        ) : (
          <>
            <div className="report-action-row">
              <input type="email" required className="input-v2" placeholder="you@example.com"
                value={scheduleEmail} onChange={(e) => setScheduleEmail(e.target.value)} />
              <select className="input-v2" style={{ flex: "0 0 120px" }} value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)}>
                {HOROSCOPE_TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <button className="btn btn-primary btn-sm" type="submit" disabled={scheduleStatus === "sending"}>
                {scheduleStatus === "sending" ? "…" : hi ? "शेड्यूल करें" : "Schedule"}
              </button>
            </div>
            {scheduleStatus === "error" && <p className="city-note warn">{hi ? "अभी शेड्यूल नहीं हो सका — दोबारा प्रयास करें।" : "Could not schedule right now — please try again."}</p>}
          </>
        )}
      </form>
    </div>
  );
}

/**
 * Planetary positions. Renders as a table on wide screens and as stacked
 * cards on phones — an 8-column table is unreadable at 360px, and phones are
 * the primary device for this audience.
 */
function PlanetsTable({
  planets, k, hi, rashi, nak, planet,
}: {
  planets: PlanetPosition[];
  k: Dictionary["kundali"];
  hi: boolean;
  rashi: (v: string) => string;
  nak: (v: string) => string;
  planet: (v: string) => string;
}) {
  const isLagna = (p: PlanetPosition) => p.planet.toLowerCase() === "ascendant";
  return (
    <>
      <div className="card table-wrap planets-table-wide">
        <table className="planets">
          <thead>
            <tr>
              <th>{k.planetCol}</th><th>{k.signCol}</th><th>{k.houseCol}</th><th>{k.degreeCol}</th>
              <th>{k.nakshatraCol}</th><th>{k.padaCol}</th><th>{k.retroCol}</th>
            </tr>
          </thead>
          <tbody>
            {planets.map((p) => (
              <tr key={p.planet} className={isLagna(p) ? "planet-row-lagna" : ""}>
                <td><strong>{planet(p.planet)}</strong></td>
                <td>{rashi(p.sign)}</td>
                <td>{p.house || "—"}</td>
                <td className="num">{p.degree}°</td>
                <td>{nak(p.nakshatra)}</td>
                <td className="num">{p.pada || "—"}</td>
                <td>{p.retrograde ? "℞" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="planets-cards">
        {planets.map((p) => (
          <div key={p.planet} className={`planet-card${isLagna(p) ? " planet-card-lagna" : ""}`}>
            <div className="pc-head">
              <span className="pc-name">
                {planet(p.planet)}
                {p.retrograde && <span className="pc-retro" title="Retrograde">℞</span>}
              </span>
              <span className="pc-house">{k.houseCol} {p.house || "—"}</span>
            </div>
            <div className="pc-sign">{rashi(p.sign)} · {p.degree}°</div>
            <div className="pc-nak">{k.nakshatraCol}: {nak(p.nakshatra)}{p.pada ? ` (${k.padaCol} ${p.pada})` : ""}</div>
          </div>
        ))}
      </div>
    </>
  );
}

const TAB_KEYS = ["Basic", "Chart", "Panchang", "Dasha", "Doshas", "Report"] as const;
type Tab = (typeof TAB_KEYS)[number];
const TAB_LABEL_KEY: Record<Tab, keyof Dictionary["kundali"]> = {
  Basic: "tabBasic", Chart: "tabChart", Panchang: "tabPanchang", Dasha: "tabDasha",
  Doshas: "tabDoshas", Report: "tabReport",
};
const TAB_ICON: Record<Tab, string> = {
  Basic: "📋", Chart: "🕉️", Panchang: "🗓️", Dasha: "🪐", Doshas: "🛡️", Report: "📄",
};

const EMPTY_FORM: BirthDetails = {
  name: "",
  dateOfBirth: "",
  timeOfBirth: "",
  placeOfBirth: "",
  gender: "male",
  timeUnknown: false,
};

export default function KundaliPage() {
  const { t, locale } = useLanguage();
  const k = t.kundali;
  const { data: session, status: sessionStatus } = useSession();
  // Astrologers use the same tool as a professional working on a client's behalf —
  // same feature, third-person copy (item 8.2 of the platform brief).
  const isAstrologer = session?.user?.role === "astrologer";
  const [form, setForm] = useState<BirthDetails>(EMPTY_FORM);
  const [result, setResult] = useState<KundaliResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("Basic");
  const hi = locale === "hi"; // apply Vedic-term translation for Hindi; other locales keep the English astronomical terms for now

  const set = <K extends keyof BirthDetails>(key: K, value: BirthDetails[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/kundali", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, locale }),
      });
      if (!res.ok) throw new Error("Could not compute kundali. Please try again.");
      setResult((await res.json()) as KundaliResult);
      setTab("Basic");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const rashi = (v: string) => (hi ? vedic.rashi(v) : v);
  const nak = (v: string) => (hi ? vedic.nakshatra(v) : v);
  const planet = (v: string) => (hi ? vedic.planet(v) : v);

  return (
    <div className="container section">
      <h2>{isAstrologer ? "Fetch Client Kundali" : k.pageTitle}</h2>

      {!result && (
        <form className="form card" onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="name">{isAstrologer ? "Client's Full Name" : k.fullName}</label>
            <input id="name" required value={form.name} placeholder={isAstrologer ? "e.g. client name" : k.namePlaceholder}
              onChange={(e) => set("name", e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="dob">{k.dateOfBirth}</label>
            <input id="dob" type="date" required value={form.dateOfBirth}
              onChange={(e) => set("dateOfBirth", e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="tob">{k.timeOfBirth}</label>
            <input id="tob" type="time" required={!form.timeUnknown} disabled={form.timeUnknown}
              value={form.timeUnknown ? "" : form.timeOfBirth}
              onChange={(e) => set("timeOfBirth", e.target.value)} />
            <label className="checkbox-row" style={{ marginTop: 8 }}>
              <input type="checkbox" checked={form.timeUnknown ?? false}
                onChange={(e) => set("timeUnknown", e.target.checked)} />
              <span>{k.timeUnknownLabel}</span>
            </label>
            {form.timeUnknown && <p className="opt" style={{ marginTop: 4 }}>{k.timeUnknownNote}</p>}
          </div>
          <div className="field">
            <label htmlFor="pob">{k.placeOfBirth}</label>
            <PlaceAutocomplete id="pob" required value={form.placeOfBirth}
              placeholder={k.placePlaceholder} onChange={(v) => set("placeOfBirth", v)} />
          </div>
          <div className="field">
            <label htmlFor="gender">{k.gender}</label>
            <select id="gender" value={form.gender}
              onChange={(e) => set("gender", e.target.value as BirthDetails["gender"])}>
              <option value="male">{k.male}</option>
              <option value="female">{k.female}</option>
              <option value="other">{k.other}</option>
            </select>
          </div>
          {error && <p style={{ color: "var(--danger)", fontSize: "0.9rem" }}>{error}</p>}
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? k.computing : k.generate}
          </button>
        </form>
      )}

      {result && (
        <div>
          <div className="result-header-block">
            <p className="result-name">{k.resultFor} <strong>{form.name}</strong></p>
            <div className="result-facts">
              <span>📅 {form.dateOfBirth}</span>
              <span>🕐 {form.timeUnknown ? (hi ? "समय अज्ञात (दोपहर 12:00 अनुमानित)" : "Unknown (12:00 noon assumed)") : form.timeOfBirth}</span>
              <span>📍 {form.placeOfBirth}</span>
              <span>{form.gender === "female" ? "♀" : form.gender === "male" ? "♂" : "⚧"} {hi ? (form.gender === "female" ? "महिला" : form.gender === "male" ? "पुरुष" : "अन्य") : form.gender[0].toUpperCase() + form.gender.slice(1)}</span>
              <span className="result-fact-muted">{hi ? "अयनांश: लाहिड़ी" : "Ayanamsa: Lahiri"}</span>
            </div>
          </div>
          {form.timeUnknown && <p className="kundali-time-note">{k.timeUnknownBanner}</p>}
          {sessionStatus === "unauthenticated" && (
            <p className="city-note ok" style={{ marginBottom: 14 }}>
              💾 <Link href={`/login?callbackUrl=${encodeURIComponent("/kundali")}`}>Sign in</Link> to save this kundali to your account and view it anytime.
            </p>
          )}

          <nav className="kundali-tabs" aria-label="Kundali sections">
            {TAB_KEYS.map((tb) => (
              <button key={tb} type="button" className={`kundali-tab ${tab === tb ? "active" : ""}`} onClick={() => setTab(tb)}>
                <span aria-hidden="true">{TAB_ICON[tb]}</span> {k[TAB_LABEL_KEY[tb]]}
              </button>
            ))}
          </nav>

          {/* Basic */}
          <div className={`tab-panel ${tab === "Basic" ? "active" : ""}`}>
            <div className="result-summary">
              <div className="stat"><div className="label">{k.ascendant}</div><div className="value">{rashi(result.ascendant)}</div></div>
              <div className="stat"><div className="label">{k.moonSign}</div><div className="value">{rashi(result.moonSign)}</div></div>
              <div className="stat"><div className="label">{k.sunSign}</div><div className="value">{rashi(result.sunSign)}</div></div>
              <div className="stat"><div className="label">{k.nakshatra}</div><div className="value">{nak(result.nakshatra)}</div></div>
              <div className="stat"><div className="label">{k.currentDasha}</div><div className="value">{planet(result.currentDasha.replace(" Mahadasha", ""))} {hi ? "महादशा" : "Mahadasha"}</div></div>
            </div>

            <h3 className="kundali-section-title">🍀 {k.luckyFactors}</h3>
            <div className="result-summary">
              <div className="stat"><div className="label">{k.luckyGem}</div><div className="value">{hi ? vedic.gem(result.luckyGem) : result.luckyGem}</div></div>
              <div className="stat"><div className="label">{k.luckyNumber}</div><div className="value">{result.luckyNumber}</div></div>
              <div className="stat"><div className="label">{k.luckyColor}</div><div className="value">{hi ? vedic.color(result.luckyColor) : result.luckyColor}</div></div>
              <div className="stat"><div className="label">{k.favorableDirection}</div><div className="value">{hi ? vedic.direction(result.favorableDirection) : result.favorableDirection}</div></div>
            </div>

            <p className="insight">“{result.dailyInsight}”</p>
          </div>

          {/* Chart + the positions table it's drawn from, together so the two can be read against each other */}
          <div className={`tab-panel ${tab === "Chart" ? "active" : ""}`}>
            <h3 className="kundali-section-title">🕉️ {k.chartTitle}</h3>
            <div className="card chart-wrap">
              <NorthIndianChart ascendant={result.ascendant} planets={result.planets} hi={hi} />
            </div>
            <p className="kundali-disclaimer" style={{ textAlign: "center" }}>{k.chartNote}</p>

            <h3 className="kundali-section-title" style={{ marginTop: 28 }}>✨ {k.planetsTitle}</h3>
            <PlanetsTable planets={result.planets} k={k} hi={hi} rashi={rashi} nak={nak} planet={planet} />
          </div>

          {/* Panchang */}
          <div className={`tab-panel ${tab === "Panchang" ? "active" : ""}`}>
            <h3 className="kundali-section-title">🗓️ {k.panchangTitle}</h3>
            <div className="detail-grid card">
              <div><span className="dl">{k.tithi}</span><span className="dv">{hi ? vedic.tithi(result.panchang.tithi) : result.panchang.tithi}</span></div>
              <div><span className="dl">{k.vaara}</span><span className="dv">{hi ? vedic.vara(result.panchang.vara) : result.panchang.vara}</span></div>
              <div><span className="dl">{k.nakshatra}</span><span className="dv">{nak(result.panchang.nakshatra)}</span></div>
              <div><span className="dl">{k.yoga}</span><span className="dv">{result.panchang.yoga}</span></div>
              <div><span className="dl">{k.karana}</span><span className="dv">{hi ? vedic.karana(result.panchang.karana) : result.panchang.karana}</span></div>
              <div><span className="dl">{k.moonPhase}</span><span className="dv">{result.panchang.moonPhase}</span></div>
            </div>
          </div>

          {/* Dasha */}
          <div className={`tab-panel ${tab === "Dasha" ? "active" : ""}`}>
            <h3 className="kundali-section-title">🪐 {k.dashaTitle}</h3>
            <div className="grid grid-2">
              <div className="card dasha-card">
                <div className="dl">{k.mahadasha}</div>
                <div className="dasha-planet">{planet(result.mahadasha.planet)}</div>
                <div className="dasha-range">{result.mahadasha.start} → {result.mahadasha.end}</div>
              </div>
              <div className="card dasha-card">
                <div className="dl">{k.antardashaCurrent}</div>
                <div className="dasha-planet">{planet(result.antardasha.planet)}</div>
                <div className="dasha-range">{result.antardasha.start} → {result.antardasha.end}</div>
              </div>
            </div>
          </div>

          {/* Doshas & Yogas */}
          <div className={`tab-panel ${tab === "Doshas" ? "active" : ""}`}>
            <h3 className="kundali-section-title">🛡️ {k.doshaTitle}</h3>
            <div className="grid grid-3">
              <div>
                <DoshaCard title={k.mangalDosha} dosha={result.mangalDosha} kind="mangal" hi={hi} t={k} />
                <RemedyCta dosha={result.mangalDosha} remedyKey="mangal" hi={hi} t={k} />
              </div>
              <div>
                <DoshaCard title={k.sadeSati} dosha={result.sadeSati} kind="sadeSati" hi={hi} t={k} />
                <RemedyCta dosha={result.sadeSati} remedyKey="sadeSati" hi={hi} t={k} />
              </div>
              <div>
                <DoshaCard title={k.kaalSarp} dosha={result.kaalSarpDosha} kind="kaalSarp" hi={hi} t={k} />
                <RemedyCta dosha={result.kaalSarpDosha} remedyKey="kaalSarp" hi={hi} t={k} />
              </div>
            </div>

            {result.yogas.length > 0 && (
              <>
                <h3 className="kundali-section-title">🔯 {k.yogasTitle}</h3>
                <div className="grid grid-2">
                  {result.yogas.map((y) => (
                    <div key={y.name} className="card yoga-card">
                      <div className="yoga-head">
                        <span className="yoga-name">{hi ? vedic.yogaName(y.name) : y.name}</span>
                        <span className={`badge badge-${y.strength.toLowerCase()}`}>{hi ? vedic.severity(y.strength) : y.strength}</span>
                      </div>
                      <p>{hi ? (vedic.yogaEffect(y.name) || y.effect) : y.effect}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Report / download */}
          <div className={`tab-panel ${tab === "Report" ? "active" : ""}`}>
            <div className="card report-cover">
              <div className="report-cover-om">ॐ</div>
              <h3>{k.reportTitle}</h3>
              <p style={{ color: "var(--ink-soft)", marginBottom: 18 }}>{k.reportDesc}</p>
              <button className="btn btn-primary" onClick={() => window.print()}>
                ⬇ {k.downloadPdf}
              </button>
            </div>
            <ReportDelivery
              hi={hi}
              name={form.name}
              birthLine={`${form.dateOfBirth} · ${form.timeUnknown ? "—" : form.timeOfBirth} · ${form.placeOfBirth}`}
              result={result}
              defaultEmail={session?.user?.email ?? ""}
            />
          </div>

          <p className="kundali-disclaimer">{k.disclaimer}</p>

          <div className="hero-actions" style={{ justifyContent: "flex-start", marginTop: 24 }}>
            <a href="/astrologers" target="_blank" rel="noopener noreferrer" className="btn btn-primary">{k.discussAstrologer}</a>
            <a href="/seva" target="_blank" rel="noopener noreferrer" className="btn btn-outline">{k.bookRemedy}</a>
            <a href="/kundali" target="_blank" rel="noopener noreferrer" className="btn btn-outline">{k.newKundali} ({t.common.opensNewTab})</a>
          </div>
        </div>
      )}
    </div>
  );
}
