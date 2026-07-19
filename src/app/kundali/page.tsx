"use client";

import { useState, FormEvent } from "react";
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

export default function KundaliPage() {
  const [form, setForm] = useState<BirthDetails>({
    name: "",
    dateOfBirth: "",
    timeOfBirth: "",
    placeOfBirth: "",
    gender: "male",
  });
  const [result, setResult] = useState<KundaliResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
            <input id="tob" type="time" required value={form.timeOfBirth}
              onChange={(e) => set("timeOfBirth", e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="pob">Place of Birth</label>
            <input id="pob" required value={form.placeOfBirth} placeholder="e.g. Ayodhya, Uttar Pradesh"
              onChange={(e) => set("placeOfBirth", e.target.value)} />
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
          <p className="result-name">Kundali for <strong>{form.name}</strong></p>

          <div className="result-summary">
            <div className="stat"><div className="label">Ascendant (Lagna)</div><div className="value">{result.ascendant}</div></div>
            <div className="stat"><div className="label">Moon Sign (Rashi)</div><div className="value">{result.moonSign}</div></div>
            <div className="stat"><div className="label">Sun Sign</div><div className="value">{result.sunSign}</div></div>
            <div className="stat"><div className="label">Nakshatra</div><div className="value">{result.nakshatra}</div></div>
            <div className="stat"><div className="label">Current Dasha</div><div className="value">{result.currentDasha}</div></div>
          </div>

          {/* Panchang at birth */}
          <h3 className="kundali-section-title">🗓️ Birth Panchang</h3>
          <div className="detail-grid card">
            <div><span className="dl">Tithi</span><span className="dv">{result.panchang.tithi}</span></div>
            <div><span className="dl">Vaara (Weekday)</span><span className="dv">{result.panchang.vara}</span></div>
            <div><span className="dl">Nakshatra</span><span className="dv">{result.panchang.nakshatra}</span></div>
            <div><span className="dl">Yoga</span><span className="dv">{result.panchang.yoga}</span></div>
            <div><span className="dl">Karana</span><span className="dv">{result.panchang.karana}</span></div>
            <div><span className="dl">Moon Phase</span><span className="dv">{result.panchang.moonPhase}</span></div>
          </div>

          {/* Dasha */}
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

          {/* Dosha check */}
          <h3 className="kundali-section-title">🛡️ Dosha &amp; Transit Check</h3>
          <div className="grid grid-3">
            <DoshaCard title="Mangal Dosha (Manglik)" dosha={result.mangalDosha} />
            <DoshaCard title="Sade Sati" dosha={result.sadeSati} />
            <DoshaCard title="Kaal Sarp Dosha" dosha={result.kaalSarpDosha} />
          </div>

          {/* Planet table */}
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

          {/* Yogas */}
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

          {/* Lucky attributes */}
          <h3 className="kundali-section-title">🍀 Your Lucky Factors</h3>
          <div className="result-summary">
            <div className="stat"><div className="label">Lucky Gem</div><div className="value">{result.luckyGem}</div></div>
            <div className="stat"><div className="label">Lucky Number</div><div className="value">{result.luckyNumber}</div></div>
            <div className="stat"><div className="label">Lucky Color</div><div className="value">{result.luckyColor}</div></div>
            <div className="stat"><div className="label">Favorable Direction</div><div className="value">{result.favorableDirection}</div></div>
          </div>

          <p className="insight">“{result.dailyInsight}”</p>

          <p className="kundali-disclaimer">
            For informational and spiritual purposes only. For a personalized reading of what
            these placements mean, consult an Ayodhya-verified astrologer.
          </p>

          <div className="hero-actions" style={{ justifyContent: "flex-start", marginTop: 24 }}>
            <a href="/astrologers" className="btn btn-primary">Discuss with an Astrologer</a>
            <a href="/seva" className="btn btn-outline">Book a Remedial Puja</a>
            <button className="btn btn-outline" onClick={() => setResult(null)}>New Kundali</button>
          </div>
        </div>
      )}
    </div>
  );
}
