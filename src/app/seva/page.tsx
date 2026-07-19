"use client";

import { useState, FormEvent } from "react";
import { PUJA_OFFERINGS } from "@/lib/data/pujas";
import type { PujaOffering } from "@/types";

const COUNTRIES = ["India", "USA", "UK", "UAE", "Canada", "Australia", "Singapore", "Other"];

export default function SevaPage() {
  const [selected, setSelected] = useState<PujaOffering | null>(null);
  const [booked, setBooked] = useState(false);
  const [form, setForm] = useState({
    devoteeName: "",
    gotra: "",
    sankalp: "",
    preferredDate: "",
    shippingCountry: "India",
    shippingAddress: "",
    wantsLiveVideo: true,
  });

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    // MOCK: no payment/scheduling yet. Production wires Razorpay + pandit slotting.
    setBooked(true);
  }

  // --- Confirmation ---
  if (booked && selected) {
    return (
      <div className="container section" style={{ maxWidth: 640 }}>
        <div className="card puja-confirm">
          <div className="confirm-check">🙏</div>
          <h2>Sankalp Received</h2>
          <p>
            Your <strong>{selected.name}</strong> at <strong>{selected.temple}</strong> has been
            requested in the name of <strong>{form.devoteeName}</strong>
            {form.gotra ? ` (${form.gotra} gotra)` : ""}.
          </p>
          <p className="confirm-note">
            Our team will compute the auspicious muhurat from the sankalp and confirm your date &amp;
            {form.wantsLiveVideo ? " live video link" : " recording"} on WhatsApp. Prasad will be
            couriered to {form.shippingCountry}.
          </p>
          <p className="confirm-amount">Amount to confirm: ₹{selected.priceINR.toLocaleString("en-IN")}</p>
          <button className="btn btn-primary" onClick={() => { setBooked(false); setSelected(null); }}>
            Book Another Seva
          </button>
        </div>
      </div>
    );
  }

  // --- Booking form ---
  if (selected) {
    return (
      <div className="container section" style={{ maxWidth: 560 }}>
        <button className="link-back" onClick={() => setSelected(null)}>← All sevas</button>
        <h2>{selected.name}</h2>
        <p className="puja-sub">{selected.temple} · {selected.deity}</p>

        <form className="form card" onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="dn">Devotee Name (for the sankalp)</label>
            <input id="dn" required value={form.devoteeName}
              placeholder="Name the puja is performed for"
              onChange={(e) => set("devoteeName", e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="go">Gotra <span className="opt">(optional)</span></label>
            <input id="go" value={form.gotra} placeholder="e.g. Bharadwaj"
              onChange={(e) => set("gotra", e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="sk">Your Sankalp / Wish</label>
            <input id="sk" value={form.sankalp} placeholder="e.g. Good health for my mother"
              onChange={(e) => set("sankalp", e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="pd">Preferred Date <span className="opt">(we confirm the muhurat)</span></label>
            <input id="pd" type="date" value={form.preferredDate}
              onChange={(e) => set("preferredDate", e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="sc">Prasad Shipping Country</label>
            <select id="sc" value={form.shippingCountry}
              onChange={(e) => set("shippingCountry", e.target.value)}>
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="sa">Shipping Address</label>
            <input id="sa" required value={form.shippingAddress}
              placeholder="Where should we courier the prasad?"
              onChange={(e) => set("shippingAddress", e.target.value)} />
          </div>
          <label className="checkbox-row">
            <input type="checkbox" checked={form.wantsLiveVideo}
              onChange={(e) => set("wantsLiveVideo", e.target.checked)} />
            <span>Stream the puja live to me (video call)</span>
          </label>

          <div className="puja-price-row">
            <span>Total</span>
            <strong>₹{selected.priceINR.toLocaleString("en-IN")}</strong>
          </div>
          <button className="btn btn-primary" type="submit">Offer Sankalp</button>
          <p className="ai-disclaimer">
            Payment is collected after we confirm your muhurat. Spiritual service; no outcome is guaranteed.
          </p>
        </form>
      </div>
    );
  }

  // --- Catalog ---
  return (
    <div className="container section">
      <span className="hero-eyebrow" style={{ marginBottom: 12 }}>
        <span className="live" aria-hidden="true" /> Performed by Ayodhya-Verified Pandits
      </span>
      <h2>Seva — Puja in Ayodhya, in Your Name</h2>
      <p className="puja-intro">
        Cannot travel to Ayodhya? Have a puja performed for you by a verified pandit in a real
        Ayodhya temple — streamed live, with prasad couriered to your door, anywhere in the world.
      </p>

      <div className="grid grid-3">
        {PUJA_OFFERINGS.map((p) => (
          <div key={p.id} className="card puja-card">
            {p.popular && <span className="puja-tag">Most Requested</span>}
            <h3>{p.name}</h3>
            <p className="puja-temple">📍 {p.temple}</p>
            <p className="puja-purpose">{p.purpose}</p>
            <div className="puja-events">
              {p.forLifeEvents.map((e) => <span key={e} className="tag">{e}</span>)}
            </div>
            <div className="puja-perks">
              {p.liveVideo && <span>📹 Live video</span>}
              {p.internationalShipping && <span>🌍 Ships worldwide</span>}
              <span>⏱ {p.durationMins} min</span>
            </div>
            <div className="puja-foot">
              <span className="rate">₹{p.priceINR.toLocaleString("en-IN")}</span>
              <button className="btn btn-primary btn-sm" onClick={() => setSelected(p)}>Book Seva</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
