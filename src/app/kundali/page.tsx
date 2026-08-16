"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import PlaceAutocomplete from "@/components/ui/PlaceAutocomplete";
import NorthIndianChart from "@/components/ui/NorthIndianChart";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { vedic } from "@/lib/i18n/vedic-terms";
import type { Dictionary } from "@/lib/i18n/dictionary";
import type { BirthDetails, DoshaSummary, KundaliResult } from "@/types";

function DoshaCard({ title, dosha, t }: { title: string; dosha: DoshaSummary; t: Dictionary["kundali"] }) {
  return (
    <div className="card dosha-card">
      <div className="dosha-head">
        <span className="dosha-title">{title}</span>
        <span className={`badge ${dosha.present ? "badge-warn" : "badge-ok"}`}>
          {dosha.present ? `${t.present} · ${dosha.severity}` : t.clear}
        </span>
      </div>
      <p>{dosha.summary}</p>
    </div>
  );
}

/** Maps a present dosha to the Seva puja that traditionally addresses it. */
const REMEDY_MAP: Record<string, { pujaId: string; title: string; reason: string }> = {
  mangal: { pujaId: "mangal-dosha-nivaran", title: "Mangal Dosha Nivaran", reason: "Traditionally performed before marriage to pacify Mars." },
  sadeSati: { pujaId: "navagraha-shanti", title: "Navagraha Shanti", reason: "Pacifies Saturn's transit during the Sade Sati phase." },
  kaalSarp: { pujaId: "navagraha-shanti", title: "Navagraha Shanti", reason: "A broad planetary-pacification remedy used for Kaal Sarp effects." },
};

function RemedyCta({ dosha, remedyKey, t }: { dosha: DoshaSummary; remedyKey: keyof typeof REMEDY_MAP; t: Dictionary["kundali"] }) {
  if (!dosha.present) return null;
  const remedy = REMEDY_MAP[remedyKey];
  return (
    <div className="remedy-cta">
      <span className="rc-ic" aria-hidden="true">🛕</span>
      <span className="rc-t">
        <b>{t.suggestedRemedy}: {remedy.title}</b>
        {remedy.reason}
      </span>
      <a href={`/seva?puja=${remedy.pujaId}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">{t.book}</a>
    </div>
  );
}

const TAB_KEYS = ["Basic", "Chart", "Panchang", "Dasha", "Doshas", "Planets", "Report"] as const;
type Tab = (typeof TAB_KEYS)[number];
const TAB_LABEL_KEY: Record<Tab, keyof Dictionary["kundali"]> = {
  Basic: "tabBasic", Chart: "tabChart", Panchang: "tabPanchang", Dasha: "tabDasha",
  Doshas: "tabDoshas", Planets: "tabPlanets", Report: "tabReport",
};
const TAB_ICON: Record<Tab, string> = {
  Basic: "📋", Chart: "🕉️", Panchang: "🗓️", Dasha: "🪐", Doshas: "🛡️", Planets: "✨", Report: "📄",
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
          <p className="result-name">{k.resultFor} <strong>{form.name}</strong> · {form.dateOfBirth} · {form.placeOfBirth}</p>
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

          {/* Chart */}
          <div className={`tab-panel ${tab === "Chart" ? "active" : ""}`}>
            <h3 className="kundali-section-title">🕉️ {k.chartTitle}</h3>
            <div className="card chart-wrap">
              <NorthIndianChart ascendant={result.ascendant} planets={result.planets} />
            </div>
            <p className="kundali-disclaimer" style={{ textAlign: "center" }}>{k.chartNote}</p>
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
                <DoshaCard title={k.mangalDosha} dosha={result.mangalDosha} t={k} />
                <RemedyCta dosha={result.mangalDosha} remedyKey="mangal" t={k} />
              </div>
              <div>
                <DoshaCard title={k.sadeSati} dosha={result.sadeSati} t={k} />
                <RemedyCta dosha={result.sadeSati} remedyKey="sadeSati" t={k} />
              </div>
              <div>
                <DoshaCard title={k.kaalSarp} dosha={result.kaalSarpDosha} t={k} />
                <RemedyCta dosha={result.kaalSarpDosha} remedyKey="kaalSarp" t={k} />
              </div>
            </div>

            {result.yogas.length > 0 && (
              <>
                <h3 className="kundali-section-title">🔯 {k.yogasTitle}</h3>
                <div className="grid grid-2">
                  {result.yogas.map((y) => (
                    <div key={y.name} className="card yoga-card">
                      <div className="yoga-head">
                        <span className="yoga-name">{y.name}</span>
                        <span className={`badge badge-${y.strength.toLowerCase()}`}>{y.strength}</span>
                      </div>
                      <p>{y.effect}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Planets */}
          <div className={`tab-panel ${tab === "Planets" ? "active" : ""}`}>
            <h3 className="kundali-section-title">✨ {k.planetsTitle}</h3>
            <div className="card table-wrap">
              <table className="planets">
                <thead>
                  <tr>
                    <th>{k.planetCol}</th><th>{k.signCol}</th><th>{k.houseCol}</th><th>{k.degreeCol}</th>
                    <th>{k.nakshatraCol}</th><th>{k.padaCol}</th><th>{k.dignityCol}</th><th>{k.retroCol}</th>
                  </tr>
                </thead>
                <tbody>
                  {result.planets.map((p) => (
                    <tr key={p.planet}>
                      <td><strong>{planet(p.planet)}</strong></td>
                      <td>{rashi(p.sign)}</td>
                      <td>{p.house}</td>
                      <td>{p.degree}°</td>
                      <td>{nak(p.nakshatra)}</td>
                      <td>{p.pada || "—"}</td>
                      <td>{hi ? vedic.dignity(p.dignity) : p.dignity}</td>
                      <td>{p.retrograde ? "℞" : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
