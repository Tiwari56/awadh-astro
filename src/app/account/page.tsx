"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import PlaceAutocomplete from "@/components/ui/PlaceAutocomplete";
import { BOOKING_STAGES, type BookingStatus } from "@/lib/bookings";

interface Address { id: string; label: string | null; line1: string; city: string; state: string | null; pincode: string | null; isDefault: boolean; }
interface KundaliRow { id: string; subjectName: string; dateOfBirth: string; placeOfBirth: string; createdAt: string; }
interface AstrologerProfile { specialties: string[]; languages: string[]; experienceYears: number; ratePerMinINR: number; bio: string | null; ayodhyaVerified: boolean; commissionPercent: number; totalConsults: number; rating: number; }
interface BookingRow { id: string; pujaName: string; devoteeName: string; amountINR: number; mode: "online" | "offline"; status: BookingStatus; createdAt: string; }
interface Summary {
  user: { name: string | null; phone: string | null; email: string | null; role: "user" | "astrologer" | "admin"; plan: "free" | "plus" } | null;
  addresses: Address[];
  walletBalanceINR: number;
  kundalis: KundaliRow[];
  astrologerProfile: AstrologerProfile | null;
  bookings: BookingRow[];
}

const STATUS_LABEL: Record<BookingStatus, string> = {
  requested: "Requested", muhurat_confirmed: "Muhurat Confirmed", performed: "Performed",
  prasad_shipped: "Prasad Shipped", delivered: "Delivered",
};

const TOPUP_OPTIONS = [200, 500, 1000];

export default function AccountPage() {
  const { status } = useSession();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [city, setCity] = useState("");
  const [line1, setLine1] = useState("");
  const [savingAddress, setSavingAddress] = useState(false);

  const [toppingUp, setToppingUp] = useState<number | null>(null);
  const [topupMsg, setTopupMsg] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/account/summary").then((r) => r.json()).then((d) => setSummary(d)).finally(() => setLoading(false));
  }, [status]);

  async function refreshSummary() {
    const d = await fetch("/api/account/summary").then((r) => r.json());
    setSummary(d);
  }

  async function addAddress() {
    if (!line1 || !city) return;
    setSavingAddress(true);
    try {
      await fetch("/api/account/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ line1, city }),
      });
      setLine1(""); setCity(""); setShowAddressForm(false);
      await refreshSummary();
    } finally {
      setSavingAddress(false);
    }
  }

  async function topUp(amount: number) {
    setToppingUp(amount);
    setTopupMsg(null);
    try {
      const res = await fetch("/api/wallet/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountINR: amount }),
      }).then((r) => r.json());
      setTopupMsg(res.cashbackApplied > 0 ? `Added ₹${amount} + ₹${res.cashbackApplied} cashback!` : `Added ₹${amount}.`);
      await refreshSummary();
    } finally {
      setToppingUp(null);
    }
  }

  // Session cookie is valid but the account it points at no longer exists in
  // the database (e.g. dev DB was reset). Middleware trusts the session's
  // cached `onboarded` claim and would otherwise bounce /login straight back
  // to "/" without ever showing the form — signing out for real here clears
  // that stale cookie so /login actually works on the next visit.
  const sessionIsStale = status === "authenticated" && !loading && summary !== null && !summary.user;
  useEffect(() => {
    if (sessionIsStale) signOut({ callbackUrl: "/login" });
  }, [sessionIsStale]);

  if (status === "loading" || loading) {
    return <div className="container section"><p>Loading your account…</p></div>;
  }
  if (status !== "authenticated") {
    return (
      <div className="container section">
        <p>Please <Link href="/login">sign in</Link> to view your account.</p>
      </div>
    );
  }
  if (!summary || !summary.user) {
    return <div className="container section"><p>Your session has expired. Signing you out…</p></div>;
  }

  const { user } = summary;
  const isAstrologer = user.role === "astrologer";
  const isAdmin = user.role === "admin";

  return (
    <div className="container section" style={{ maxWidth: 640 }}>
      <div className="acct-hero card-v2 card-gilded rise">
        <div className="acct-hero-top">
          <div className="acct-avatar" aria-hidden="true">{(user.name ?? "?")[0]?.toUpperCase()}</div>
          <div className="acct-id">
            <div className="acct-name">{user.name || "Devotee"}</div>
            <div className="acct-contact">{user.phone || user.email}</div>
            <div className="acct-badges">
              <span className={`chip-role ${user.plan === "plus" ? "chip-plus" : ""}`}>
                {user.plan === "plus" ? "✦ Awadh Plus" : "Free Plan"}
              </span>
              {isAstrologer && <span className="chip-role chip-astro">🔮 Astrologer</span>}
              {isAdmin && <span className="chip-role chip-admin">🛡 Admin</span>}
            </div>
          </div>
        </div>
        <div className="acct-hero-stats">
          <div className="stat-v2"><span className="sv">₹{summary.walletBalanceINR.toLocaleString("en-IN")}</span><span className="sl">Wallet</span></div>
          <div className="stat-v2"><span className="sv">{summary.bookings.length}</span><span className="sl">Bookings</span></div>
          <div className="stat-v2"><span className="sv">{summary.kundalis.length}</span><span className="sl">Kundalis</span></div>
        </div>
        <button className="btn btn-outline btn-sm acct-signout" onClick={() => signOut({ callbackUrl: "/" })}>Sign Out</button>
      </div>

      {isAdmin && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ marginBottom: 6 }}>Admin</h3>
          <p style={{ color: "var(--ink-soft)", marginBottom: 12 }}>Platform-wide controls — coming in a later sprint.</p>
          <Link href="#" className="btn btn-outline btn-sm" onClick={(e) => e.preventDefault()}>Admin Dashboard (coming soon)</Link>
        </div>
      )}

      {isAstrologer && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ marginBottom: 6 }}>Your Earnings</h3>
          <p style={{ color: "var(--ink-soft)", marginBottom: 12 }}>
            Illustrative summary — live payouts and a full earnings dashboard are coming in a later sprint.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div className="stat-block"><div style={{ fontSize: "1.3rem", fontWeight: 700 }}>{summary.astrologerProfile?.totalConsults ?? 0}</div><div style={{ color: "var(--ink-soft)", fontSize: "0.8rem" }}>Consultations</div></div>
            <div className="stat-block"><div style={{ fontSize: "1.3rem", fontWeight: 700 }}>{100 - (summary.astrologerProfile?.commissionPercent ?? 30)}%</div><div style={{ color: "var(--ink-soft)", fontSize: "0.8rem" }}>Your share per consult</div></div>
          </div>
          <Link href="#" className="btn btn-outline btn-sm" style={{ marginTop: 12 }} onClick={(e) => e.preventDefault()}>Astrologer Dashboard (coming soon)</Link>
        </div>
      )}

      <div className="card-v2 rise rise-1 acct-sec">
        <div className="acct-sec-head"><h3>Wallet</h3></div>
        <div className="wallet-panel">
          <span className="wallet-label">Available balance</span>
          <span className="wallet-amount">₹{summary.walletBalanceINR.toLocaleString("en-IN")}</span>
        </div>
        <p className="acct-hint">Add money to keep consultations uninterrupted.</p>
        <div className="topup-options">
          {TOPUP_OPTIONS.map((amt) => (
            <button key={amt} type="button" className="topup-chip" disabled={toppingUp !== null} onClick={() => topUp(amt)}>
              {toppingUp === amt ? "Adding…" : `+ ₹${amt}`}
            </button>
          ))}
        </div>
        {topupMsg && <p className="city-note ok" style={{ marginTop: 10 }}>{topupMsg}</p>}
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginBottom: 10 }}>Address</h3>
        {summary.addresses.length > 0 ? (
          summary.addresses.map((a) => (
            <div key={a.id} style={{ marginBottom: 8 }}>
              <div style={{ fontWeight: 600 }}>{a.label || "Home"}</div>
              <div style={{ color: "var(--ink-soft)", fontSize: "0.9rem" }}>{a.line1}, {a.city}{a.pincode ? ` – ${a.pincode}` : ""}</div>
            </div>
          ))
        ) : (
          <p style={{ color: "var(--ink-soft)", marginBottom: 10 }}>No address saved yet.</p>
        )}
        {showAddressForm ? (
          <div style={{ marginTop: 10 }}>
            <div className="field">
              <label htmlFor="acc-city">City</label>
              <PlaceAutocomplete id="acc-city" value={city} placeholder="Start typing a city…" onChange={setCity} />
            </div>
            <div className="field">
              <label htmlFor="acc-line1">Address</label>
              <input id="acc-line1" value={line1} placeholder="House / street / landmark" onChange={(e) => setLine1(e.target.value)} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-outline btn-sm" onClick={() => setShowAddressForm(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" disabled={!line1 || !city || savingAddress} onClick={addAddress}>
                {savingAddress ? "Saving…" : "Save Address"}
              </button>
            </div>
          </div>
        ) : (
          <button className="btn btn-outline btn-sm" onClick={() => setShowAddressForm(true)}>+ Add Address</button>
        )}
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginBottom: 10 }}>{isAstrologer ? "Kundalis You've Fetched" : "My Kundalis"}</h3>
        {summary.kundalis.length > 0 ? (
          summary.kundalis.map((k) => (
            <div key={k.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--line)" }}>
              <div>
                <div style={{ fontWeight: 600 }}>{k.subjectName}</div>
                <div style={{ color: "var(--ink-soft)", fontSize: "0.85rem" }}>{k.dateOfBirth} · {k.placeOfBirth}</div>
              </div>
            </div>
          ))
        ) : (
          <p style={{ color: "var(--ink-soft)" }}>
            {isAstrologer ? "No client kundalis fetched yet." : "No kundalis saved yet."}{" "}
            <Link href="/kundali">{isAstrologer ? "Fetch a client kundali" : "Get your free kundali"}</Link>
          </p>
        )}
      </div>

      <div className="card-v2 rise rise-2 acct-sec">
        <div className="acct-sec-head">
          <h3>My Bookings</h3>
          {summary.bookings.length > 0 && <Link href="/seva/bookings" className="acct-link">View all →</Link>}
        </div>
        {summary.bookings.length > 0 ? (
          <div className="bk-list">
            {summary.bookings.slice(0, 3).map((b) => {
              const stage = BOOKING_STAGES.indexOf(b.status);
              return (
                <div key={b.id} className="bk-item">
                  <div className="bk-top">
                    <div className="bk-meta">
                      <span className="bk-name">{b.pujaName}</span>
                      <span className="bk-sub">{b.devoteeName} · {new Date(b.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                    <span className="bk-amt">₹{b.amountINR.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="bk-track" role="img" aria-label={`Status: ${STATUS_LABEL[b.status]}, step ${stage + 1} of ${BOOKING_STAGES.length}`}>
                    {BOOKING_STAGES.map((st, i) => (
                      <span key={st} className={`bk-node${i <= stage ? " done" : ""}${i === stage ? " now" : ""}`} />
                    ))}
                  </div>
                  <span className="bk-status">{STATUS_LABEL[b.status]}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="acct-empty">No bookings yet. <Link href="/seva">Book a Seva →</Link></p>
        )}
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginBottom: 10 }}>Spiritual Shop</h3>
        <p style={{ color: "var(--ink-soft)", marginBottom: 10 }}>Gemstones, rudraksh and more — browse our starter collection.</p>
        <Link href="/shop" className="btn btn-outline btn-sm">Browse Shop</Link>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 10 }}>Contact Support</h3>
        <p style={{ color: "var(--ink-soft)", marginBottom: 10 }}>Need help with a booking, consultation, or your account?</p>
        <a href="mailto:support@awadhastro.com" className="btn btn-outline btn-sm">Email Support</a>
      </div>
    </div>
  );
}
