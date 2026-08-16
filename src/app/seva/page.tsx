"use client";

import { Suspense, useEffect, useMemo, useState, FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import PlaceAutocomplete from "@/components/ui/PlaceAutocomplete";
import { PUJA_OFFERINGS, PUJA_ADDONS, isCityServiceable } from "@/lib/data/pujas";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { PujaOffering } from "@/types";

const COUNTRIES = ["India", "USA", "UK", "UAE", "Canada", "Australia", "Singapore", "Other"];

function SevaPageInner() {
  const { t } = useLanguage();
  const sv = t.seva;
  const { data: session, status: sessionStatus } = useSession();
  const searchParams = useSearchParams();
  const remedyPujaId = searchParams.get("puja"); // present when deep-linked from a kundali dosha remedy
  const [selected, setSelected] = useState<PujaOffering | null>(null);
  const [booked, setBooked] = useState(false);
  const [addonIds, setAddonIds] = useState<string[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState<{ code: string; discountINR: number } | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    devoteeName: "",
    gotra: "",
    sankalp: "",
    preferredDate: "",
    city: "",
    shippingCountry: "India",
    shippingAddress: "",
    wantsLiveVideo: true,
    mode: "online" as "online" | "offline",
  });

  useEffect(() => {
    if (sessionStatus !== "authenticated") return;
    fetch("/api/wallet").then((r) => r.json()).then((d) => setWalletBalance(d.balanceINR ?? 0)).catch(() => {});
  }, [sessionStatus]);

  // Deep link from the kundali remedy CTA: /seva?puja=<id> auto-opens that booking form.
  useEffect(() => {
    if (remedyPujaId) {
      const found = PUJA_OFFERINGS.find((p) => p.id === remedyPujaId);
      if (found) setSelected(found);
    }
  }, [remedyPujaId]);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggleAddon = (id: string) =>
    setAddonIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const cityServiceable = isCityServiceable(form.city);
  const selectedAddons = useMemo(() => PUJA_ADDONS.filter((a) => addonIds.includes(a.id)), [addonIds]);
  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.priceINR, 0);
  const subtotal = (selected?.priceINR ?? 0) + addonsTotal;
  const total = Math.max(0, subtotal - (promoApplied?.discountINR ?? 0));

  /**
   * Dummy promo logic — placeholder for the rate-based promotion/discount
   * engine that will come with phone-OTP account management. AWADH100 is a
   * hardcoded demo code; a real implementation looks up codes server-side
   * against a promotions table tied to the signed-in user.
   */
  function applyPromo() {
    const code = promoCode.trim().toUpperCase();
    if (code === "AWADH100") setPromoApplied({ code, discountINR: 100 });
    else setPromoApplied(null);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setPaymentError(null);
    setSubmitting(true);
    try {
      if (form.mode === "online") {
        const res = await fetch("/api/wallet/deduct", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amountINR: total, reason: `Seva: ${selected.name}` }),
        });
        const data = await res.json();
        if (!res.ok) {
          setPaymentError(sv.insufficientBalance);
          return;
        }
        setWalletBalance(data.balanceINR ?? 0);
      }
      // offline mode: no charge now — cash is collected in person before the puja begins.

      await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pujaId: selected.id,
          pujaName: selected.name,
          devoteeName: form.devoteeName,
          amountINR: total,
          mode: form.mode,
        }),
      });
      setBooked(true);
    } finally {
      setSubmitting(false);
    }
  }

  // Suggestions shown on the confirmation screen instead of a generic "book another" button.
  const suggestions = useMemo(() => {
    if (!selected) return [];
    return PUJA_OFFERINGS.filter((p) => p.id !== selected.id).slice(0, 3);
  }, [selected]);

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
            {selectedAddons.length > 0 && ` Add-ons: ${selectedAddons.map((a) => a.label).join(", ")}.`}
          </p>
          <p className="confirm-note">
            Our team will compute the auspicious muhurat from the sankalp and confirm your date &amp;
            {form.wantsLiveVideo ? " live video link" : " recording"} on WhatsApp.
            {form.mode === "online" ? " Payment has been deducted from your wallet." : " Please keep cash ready before the puja begins."}
            {" "}Prasad will be couriered to {form.shippingCountry}.
          </p>
          <p className="confirm-amount">{form.mode === "online" ? "Amount paid" : "Amount due (cash)"}: ₹{total.toLocaleString("en-IN")}</p>

          <Link href="/seva/bookings" className="btn btn-outline" style={{ marginBottom: 20 }}>
            {sv.viewMyBookings}
          </Link>

          <div className="confirm-suggestions">
            <h4>{sv.suggestedForYou}</h4>
            {remedyPujaId && <p className="opt" style={{ marginBottom: 10 }}>{sv.remedyBookedNote}</p>}
            <div className="grid grid-3">
              {suggestions.map((p) => (
                <a key={p.id} href={`/seva?puja=${p.id}`} target="_blank" rel="noopener noreferrer" className="card suggestion-card">
                  <div className="suggestion-title">{p.name}</div>
                  <div className="suggestion-meta">₹{p.priceINR.toLocaleString("en-IN")} · {p.temple}</div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Sign-in gate — booking collects devotee/address details, so it needs an account ---
  if (selected && sessionStatus === "unauthenticated") {
    return (
      <div className="container section" style={{ maxWidth: 480 }}>
        <button className="link-back" onClick={() => setSelected(null)}>← All sevas</button>
        <div className="card auth-card">
          <div className="auth-om">🙏</div>
          <h2 style={{ textAlign: "center", marginBottom: 6 }}>Sign in to book {selected.name}</h2>
          <p style={{ textAlign: "center", color: "var(--ink-soft)", fontSize: "0.9rem", marginBottom: 20 }}>
            We need an account to confirm your sankalp, track your booking, and courier prasad to your address.
          </p>
          <Link href={`/login?callbackUrl=${encodeURIComponent(`/seva?puja=${selected.id}`)}`} className="btn btn-primary" style={{ width: "100%" }}>
            Sign In to Continue
          </Link>
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
          {/* Add-ons cart — live total updates as items are toggled */}
          <div className="field">
            <label>{sv.addonsLabel} <span className="opt">({t.common.optional})</span></label>
            <div className="addon-list">
              {PUJA_ADDONS.map((a) => (
                <label key={a.id} className="addon-row">
                  <input type="checkbox" checked={addonIds.includes(a.id)} onChange={() => toggleAddon(a.id)} />
                  <span className="addon-info">
                    <span className="addon-label">{a.label}</span>
                    <span className="addon-desc">{a.description}</span>
                  </span>
                  <span className="addon-price">+₹{a.priceINR.toLocaleString("en-IN")}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Delivery/location fields surface immediately once a delivery-sensitive
              add-on (bhandara/in-person) is selected, so serviceability is clear
              before the devotee fills in everything else. */}
          <div className="field">
            <label htmlFor="ct">{sv.yourCity}</label>
            <PlaceAutocomplete id="ct" value={form.city} placeholder="Start typing a city…" onChange={(v) => set("city", v)} />
            {addonIds.includes("bhandara") && (
              <p className={`city-note ${cityServiceable ? "ok" : "warn"}`}>
                {cityServiceable
                  ? "✓ Bhandara/NGO delivery is available in your city."
                  : "In-person bhandara isn't serviceable there yet — we'll convert this to a prasad-courier equivalent and confirm on WhatsApp."}
              </p>
            )}
          </div>
          <div className="field">
            <label htmlFor="sc">{sv.shippingCountry}</label>
            <select id="sc" value={form.shippingCountry}
              onChange={(e) => set("shippingCountry", e.target.value)}>
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="sa">{sv.shippingAddress}</label>
            <input id="sa" required value={form.shippingAddress}
              placeholder={sv.shippingAddressPlaceholder}
              onChange={(e) => set("shippingAddress", e.target.value)} />
          </div>

          <div className="field">
            <label htmlFor="dn">{sv.devoteeName}</label>
            <input id="dn" required value={form.devoteeName}
              placeholder={sv.devoteeNamePlaceholder}
              onChange={(e) => set("devoteeName", e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="go">{sv.gotra} <span className="opt">({t.common.optional})</span></label>
            <input id="go" value={form.gotra} placeholder="e.g. Bharadwaj"
              onChange={(e) => set("gotra", e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="sk">{sv.sankalp}</label>
            <input id="sk" value={form.sankalp} placeholder={sv.sankalpPlaceholder}
              onChange={(e) => set("sankalp", e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="pd">{sv.preferredDate} <span className="opt">({sv.muhuratNote})</span></label>
            <input id="pd" type="date" value={form.preferredDate}
              onChange={(e) => set("preferredDate", e.target.value)} />
          </div>
          <label className="checkbox-row">
            <input type="checkbox" checked={form.wantsLiveVideo}
              onChange={(e) => set("wantsLiveVideo", e.target.checked)} />
            <span>{sv.liveStream}</span>
          </label>

          {/* Promo code — dummy for now; real rate-based promotions arrive with
              phone-OTP account management. */}
          <div className="field">
            <label htmlFor="promo">{sv.promoCode} <span className="opt">({t.common.optional})</span></label>
            <div style={{ display: "flex", gap: 8 }}>
              <input id="promo" value={promoCode} placeholder="e.g. AWADH100"
                onChange={(e) => setPromoCode(e.target.value)} style={{ flex: 1 }} />
              <button type="button" className="btn btn-outline btn-sm" onClick={applyPromo}>{sv.applyPromo}</button>
            </div>
            {promoApplied && <p className="city-note ok">✓ {promoApplied.code} applied — ₹{promoApplied.discountINR} off</p>}
          </div>

          {/* Puja mode: online (prepaid via wallet) vs offline (cash before the ritual). */}
          <div className="field">
            <label>{sv.modeLabel}</label>
            <div className="mode-toggle">
              <button type="button" className={`mode-btn ${form.mode === "online" ? "active" : ""}`} onClick={() => set("mode", "online")}>
                💻 {sv.modeOnline}
              </button>
              <button type="button" className={`mode-btn ${form.mode === "offline" ? "active" : ""}`} onClick={() => set("mode", "offline")}>
                🛕 {sv.modeOffline}
              </button>
            </div>
          </div>

          {selectedAddons.length > 0 && (
            <div className="cart-summary">
              <div className="cart-row"><span>{selected.name}</span><span>₹{selected.priceINR.toLocaleString("en-IN")}</span></div>
              {selectedAddons.map((a) => (
                <div className="cart-row" key={a.id}><span>+ {a.label}</span><span>₹{a.priceINR.toLocaleString("en-IN")}</span></div>
              ))}
              {promoApplied && <div className="cart-row"><span>− {promoApplied.code}</span><span>−₹{promoApplied.discountINR}</span></div>}
            </div>
          )}
          <div className="puja-price-row">
            <span>{sv.total}</span>
            <strong>₹{total.toLocaleString("en-IN")}</strong>
          </div>

          {form.mode === "online" ? (
            <p className="wallet-balance-row">
              <span>{sv.walletBalance}: ₹{walletBalance.toLocaleString("en-IN")}</span>
            </p>
          ) : (
            <p className="opt">{sv.payCash}</p>
          )}
          {paymentError && <p style={{ color: "var(--danger)", fontSize: "0.9rem" }}>{paymentError}</p>}

          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? "…" : form.mode === "online" ? sv.payNow : sv.offerSankalp}
          </button>
          <p className="ai-disclaimer">{sv.paymentNote}</p>
        </form>
      </div>
    );
  }

  // --- Catalog ---
  return (
    <div className="container section">
      <span className="hero-eyebrow" style={{ marginBottom: 12 }}>
        <span className="live" aria-hidden="true" /> {sv.verifiedBadge}
      </span>
      <h2>{sv.pageTitle}</h2>
      <p className="puja-intro">{sv.intro}</p>
      <Link href="/seva/bookings" style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--gold-bright)", display: "inline-block", marginBottom: 20 }}>
        📋 {sv.viewMyBookings} →
      </Link>

      <div className="grid grid-3">
        {PUJA_OFFERINGS.map((p) => (
          <div key={p.id} className="card puja-card">
            {p.popular && <span className="puja-tag">{sv.mostRequested}</span>}
            <h3>{p.name}</h3>
            <p className="puja-temple">📍 {p.temple}</p>
            <p className="puja-purpose">{p.purpose}</p>
            <div className="puja-events">
              {p.forLifeEvents.map((e) => <span key={e} className="tag">{e}</span>)}
            </div>
            <div className="puja-perks">
              {p.liveVideo && <span>📹 {sv.liveVideo}</span>}
              {p.internationalShipping && <span>🌍 {sv.shipsWorldwide}</span>}
              <span>⏱ {p.durationMins} min</span>
            </div>
            <div className="puja-foot">
              <span className="rate">₹{p.priceINR.toLocaleString("en-IN")}</span>
              <button className="btn btn-primary btn-sm" onClick={() => setSelected(p)}>{sv.bookSeva}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SevaPage() {
  return (
    <Suspense fallback={<div className="container section">Loading…</div>}>
      <SevaPageInner />
    </Suspense>
  );
}
