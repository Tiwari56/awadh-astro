"use client";

import { useState, FormEvent } from "react";
import PlaceAutocomplete from "@/components/ui/PlaceAutocomplete";
import NorthIndianChart from "@/components/ui/NorthIndianChart";
import type { BirthDetails, DoshaSummary, KundaliResult } from "@/types";

function DoshaCard({ title, dosha }: { title: string; dosha: DoshaSummary }) {
  return (
    <div className="card dosha-card">
      <div className="dosha-head">
        <span className="dosha-title">{title}</span>
        <span className={`badge ${dosha.present ? "badge-warn" : "badge-ok"}`}>
          {dosha.present ? `Present · ${dosha.severity}` : "Clear"}
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

function RemedyCta({ dosha, remedyKey }: { dosha: DoshaSummary; remedyKey: keyof typeof REMEDY_MAP }) {
  if (!dosha.present) return null;
  const remedy = REMEDY_MAP[remedyKey];
  return (
    <div className="remedy-cta">
      <span className="rc-ic" aria-hidden="true">🛕</span>
      <span className="rc-t">
        <b>Suggested remedy: {remedy.title}</b>
        {remedy.reason}
      </span>
      <a href={`/seva?puja=${remedy.pujaId}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">Book</a>
    </div>
  );
}

const TABS = ["Basic", "Chart", "Panchang", "Dasha", "Doshas", "Planets", "Report"] as const;
type Tab = (typeof TABS)[number];

const EMPTY_FORM: BirthDetails = {
  name: "",
  dateOfBirth: "",
  timeOfBirth: "",
  placeOfBirth: "",
  gender: "male",
  timeUnknown: false,
};

export default function KundaliPage() {
  const [form, setForm] = useState<BirthDetails>(EMPTY_FORM);
  const [result, setResult] = useState<KundaliResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("Basic");

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
        body: JSON.stringify(form),
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

  return (
    <div className="container section">
      <h2>Free Kundali &amp; Birth Chart</h2>

      {!result && (
        <form className="form card" onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="name">Full Name</label>
            <input id="name" required value={form.name} placeholder="e.g. Nishit Tiwari"
              onChange={(e) => set("name", e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="dob">Date of Birth</label>
            <input id="dob" type="date" required value={form.dateOfBirth}
              onChange={(e) => set("dateOfBirth", e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="tob">Time of Birth</label>
            <input id="tob" type="time" required={!form.timeUnknown} disabled={form.timeUnknown}
              value={form.timeUnknown ? "" : form.timeOfBirth}
              onChange={(e) => set("timeOfBirth", e.target.value)} />
            <label className="checkbox-row" style={{ marginTop: 8 }}>
              <input type="checkbox" checked={form.timeUnknown ?? false}
                onChange={(e) => set("timeUnknown", e.target.checked)} />
              <span>I don&apos;t know my exact birth time</span>
            </label>
            {form.timeUnknown && (
              <p className="opt" style={{ marginTop: 4 }}>
                We&apos;ll use 12:00 noon as a standard approximation. Your Moon sign and nakshatra will
                still be accurate; Ascendant and house positions become approximate.
              </p>
            )}
          </div>
          <div className="field">
            <label htmlFor="pob">Place of Birth</label>
            <PlaceAutocomplete id="pob" required value={form.placeOfBirth}
              placeholder="Start typing a city…" onChange={(v) => set("placeOfBirth", v)} />
          </div>
          <div className="field">
            <label htmlFor="gender">Gender</label>
            <select id="gender" value={form.gender}
              onChange={(e) => set("gender", e.target.value as BirthDetails["gender"])}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          {error && <p style={{ color: "var(--danger)", fontSize: "0.9rem" }}>{error}</p>}
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Computing…" : "Generate Kundali"}
          </button>
        </form>
      )}

      {result && (
        <div>
          <p className="result-name">Kundali for <strong>{form.name}</strong> · {form.dateOfBirth} · {form.placeOfBirth}</p>
          {form.timeUnknown && (
            <p className="kundali-time-note">
              ⚠️ Birth time unknown — computed using 12:00 noon. Ascendant and house placements shown
              below are approximate; Moon sign and nakshatra remain accurate.
            </p>
          )}

          <nav className="kundali-tabs" aria-label="Kundali sections">
            {TABS.map((tb) => (
              <button key={tb} type="button" className={`kundali-tab ${tab === tb ? "active" : ""}`} onClick={() => setTab(tb)}>
                {tb}
              </button>
            ))}
          </nav>

          {/* Basic */}
          <div className={`tab-panel ${tab === "Basic" ? "active" : ""}`}>
            <div className="result-summary">
              <div className="stat"><div className="label">Ascendant (Lagna)</div><div className="value">{result.ascendant}</div></div>
              <div className="stat"><div className="label">Moon Sign (Rashi)</div><div className="value">{result.moonSign}</div></div>
              <div className="stat"><div className="label">Sun Sign</div><div className="value">{result.sunSign}</div></div>
              <div className="stat"><div className="label">Nakshatra</div><div className="value">{result.nakshatra}</div></div>
              <div className="stat"><div className="label">Current Dasha</div><div className="value">{result.currentDasha}</div></div>
            </div>

            <h3 className="kundali-section-title">🍀 Your Lucky Factors</h3>
            <div className="result-summary">
              <div className="stat"><div className="label">Lucky Gem</div><div className="value">{result.luckyGem}</div></div>
              <div className="stat"><div className="label">Lucky Number</div><div className="value">{result.luckyNumber}</div></div>
              <div className="stat"><div className="label">Lucky Color</div><div className="value">{result.luckyColor}</div></div>
              <div className="stat"><div className="label">Favorable Direction</div><div className="value">{result.favorableDirection}</div></div>
            </div>

            <p className="insight">“{result.dailyInsight}”</p>
          </div>

          {/* Chart */}
          <div className={`tab-panel ${tab === "Chart" ? "active" : ""}`}>
            <h3 className="kundali-section-title">🕉️ Birth Chart (North Indian)</h3>
            <div className="card chart-wrap">
              <NorthIndianChart ascendant={result.ascendant} planets={result.planets} />
            </div>
            <p className="kundali-disclaimer" style={{ textAlign: "center" }}>
              House 1 (top) is your Ascendant. Planet positions are shown by house, following the
              standard North Indian chart convention.
            </p>
          </div>

          {/* Panchang */}
          <div className={`tab-panel ${tab === "Panchang" ? "active" : ""}`}>
            <h3 className="kundali-section-title">🗓️ Birth Panchang</h3>
            <div className="detail-grid card">
              <div><span className="dl">Tithi</span><span className="dv">{result.panchang.tithi}</span></div>
              <div><span className="dl">Vaara (Weekday)</span><span className="dv">{result.panchang.vara}</span></div>
              <div><span className="dl">Nakshatra</span><span className="dv">{result.panchang.nakshatra}</span></div>
              <div><span className="dl">Yoga</span><span className="dv">{result.panchang.yoga}</span></div>
              <div><span className="dl">Karana</span><span className="dv">{result.panchang.karana}</span></div>
              <div><span className="dl">Moon Phase</span><span className="dv">{result.panchang.moonPhase}</span></div>
            </div>
          </div>

          {/* Dasha */}
          <div className={`tab-panel ${tab === "Dasha" ? "active" : ""}`}>
            <h3 className="kundali-section-title">🪐 Vimshottari Dasha</h3>
            <div className="grid grid-2">
              <div className="card dasha-card">
                <div className="dl">Mahadasha</div>
                <div className="dasha-planet">{result.mahadasha.planet}</div>
                <div className="dasha-range">{result.mahadasha.start} → {result.mahadasha.end}</div>
              </div>
              <div className="card dasha-card">
                <div className="dl">Antardasha (current)</div>
                <div className="dasha-planet">{result.antardasha.planet}</div>
                <div className="dasha-range">{result.antardasha.start} → {result.antardasha.end}</div>
              </div>
            </div>
          </div>

          {/* Doshas & Yogas */}
          <div className={`tab-panel ${tab === "Doshas" ? "active" : ""}`}>
            <h3 className="kundali-section-title">🛡️ Dosha &amp; Transit Check</h3>
            <div className="grid grid-3">
              <div>
                <DoshaCard title="Mangal Dosha (Manglik)" dosha={result.mangalDosha} />
                <RemedyCta dosha={result.mangalDosha} remedyKey="mangal" />
              </div>
              <div>
                <DoshaCard title="Sade Sati" dosha={result.sadeSati} />
                <RemedyCta dosha={result.sadeSati} remedyKey="sadeSati" />
              </div>
              <div>
                <DoshaCard title="Kaal Sarp Dosha" dosha={result.kaalSarpDosha} />
                <RemedyCta dosha={result.kaalSarpDosha} remedyKey="kaalSarp" />
              </div>
            </div>

            {result.yogas.length > 0 && (
              <>
                <h3 className="kundali-section-title">🔯 Notable Yogas</h3>
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
            <h3 className="kundali-section-title">✨ Planetary Positions</h3>
            <div className="card table-wrap">
              <table className="planets">
                <thead>
                  <tr><th>Planet</th><th>Sign</th><th>House</th><th>Degree</th><th>Nakshatra</th><th>Pada</th><th>Dignity</th><th>Retro</th></tr>
                </thead>
                <tbody>
                  {result.planets.map((p) => (
                    <tr key={p.planet}>
                      <td><strong>{p.planet}</strong></td>
                      <td>{p.sign}</td>
                      <td>{p.house}</td>
                      <td>{p.degree}°</td>
                      <td>{p.nakshatra}</td>
                      <td>{p.pada || "—"}</td>
                      <td>{p.dignity}</td>
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
              <h3>Your Complete Kundali Report</h3>
              <p style={{ color: "var(--ink-soft)", marginBottom: 18 }}>
                Downloads every section above — birth details, chart, panchang, dashas, dosha check, and
                full planetary positions — as a single printable, devotionally styled report.
              </p>
              <button className="btn btn-primary" onClick={() => window.print()}>
                ⬇ Download PDF Report
              </button>
            </div>
          </div>

          <p className="kundali-disclaimer">
            For informational and spiritual purposes only. For a personalized reading of what
            these placements mean, consult an Ayodhya-verified astrologer.
          </p>

          <div className="hero-actions" style={{ justifyContent: "flex-start", marginTop: 24 }}>
            <a href="/astrologers" target="_blank" rel="noopener noreferrer" className="btn btn-primary">Discuss with an Astrologer</a>
            <a href="/seva" target="_blank" rel="noopener noreferrer" className="btn btn-outline">Book a Remedial Puja</a>
            <a href="/kundali" target="_blank" rel="noopener noreferrer" className="btn btn-outline">New Kundali (opens in new tab)</a>
          </div>
        </div>
      )}
    </div>
  );
}
