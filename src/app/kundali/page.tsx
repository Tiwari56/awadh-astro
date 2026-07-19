"use client";

import { useState, FormEvent } from "react";
import type { BirthDetails, KundaliResult } from "@/types";

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
        <form className="inner-card inner-form" onSubmit={onSubmit}>
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
          {error && <p style={{ color: "#ef4444", fontSize: "0.9rem", marginTop: "-10px" }}>{error}</p>}
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Computing…" : "Generate Kundali"}
          </button>
        </form>
      )}

      {result && (
        <div>
          <div className="result-summary">
            <div className="stat"><div className="label">Ascendant (Lagna)</div><div className="value">{result.ascendant}</div></div>
            <div className="stat"><div className="label">Moon Sign (Rashi)</div><div className="value">{result.moonSign}</div></div>
            <div className="stat"><div className="label">Sun Sign</div><div className="value">{result.sunSign}</div></div>
            <div className="stat"><div className="label">Nakshatra</div><div className="value">{result.nakshatra}</div></div>
            <div className="stat"><div className="label">Current Dasha</div><div className="value">{result.currentDasha}</div></div>
          </div>

          <div className="inner-card" style={{ marginTop: 24, padding: "20px 32px", overflowX: "auto" }}>
            <table className="planets-table">
              <thead>
                <tr><th>Planet</th><th>Sign</th><th>House</th><th>Degree</th><th>Retrograde</th></tr>
              </thead>
              <tbody>
                {result.planets.map((p) => (
                  <tr key={p.planet}>
                    <td>{p.planet}</td>
                    <td>{p.sign}</td>
                    <td>{p.house}</td>
                    <td>{p.degree}°</td>
                    <td>{p.retrograde ? "Yes ℞" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="insight">“{result.dailyInsight}”</p>

          <div className="hero-actions" style={{ justifyContent: "flex-start", marginTop: 24 }}>
            <a href="/astrologers" className="btn btn-primary">Discuss with an Astrologer</a>
            <button className="btn btn-outline" onClick={() => setResult(null)}>New Kundali</button>
          </div>
        </div>
      )}
    </div>
  );
}
