"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import PlaceAutocomplete from "@/components/ui/PlaceAutocomplete";
import { PLUS_PLANS } from "@/lib/data/plans";

type Step = "role" | "name" | "address" | "plan" | "wallet";
const STEPS: Step[] = ["role", "name", "address", "plan", "wallet"];

const TOPUP_OPTIONS = [200, 500, 1000];

export default function OnboardingPage() {
  const router = useRouter();
  const { update } = useSession();
  const [step, setStep] = useState<Step>("role");
  const [role, setRole] = useState<"user" | "astrologer" | null>(null);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [line1, setLine1] = useState("");
  const [addressSkipped, setAddressSkipped] = useState(false);
  const [plan, setPlan] = useState<"free" | "plus">("free");
  const [topup, setTopup] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const stepIndex = STEPS.indexOf(step);
  const goNext = () => setStep(STEPS[Math.min(stepIndex + 1, STEPS.length - 1)]);
  const goBack = () => setStep(STEPS[Math.max(stepIndex - 1, 0)]);

  async function finish(finalTopup: number | null) {
    setSubmitting(true);
    try {
      await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role, name, plan,
          address: !addressSkipped && line1 && city ? { line1, city, country: "India" } : undefined,
          walletTopupINR: finalTopup ?? 0,
        }),
      });
      await update({ onboarded: true, role }); // refresh the JWT without a full re-login
      router.push("/");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container section" style={{ maxWidth: 480 }}>
      <div className="onboarding-progress">
        {STEPS.map((s, i) => (
          <span key={s} className={`onboarding-dot ${i <= stepIndex ? "done" : ""}`} />
        ))}
      </div>

      {step === "role" && (
        <div className="card onboarding-card">
          <h2 style={{ marginBottom: 6 }}>Welcome 🙏</h2>
          <p style={{ color: "var(--ink-soft)", marginBottom: 20 }}>How will you be using Awadh Astro?</p>
          <div className="role-choice-grid">
            <button type="button" className={`role-choice ${role === "user" ? "active" : ""}`} onClick={() => setRole("user")}>
              <span className="role-choice-icon">🧑‍🤝‍🧑</span>
              <span className="role-choice-title">I&apos;m a Devotee</span>
              <span className="role-choice-desc">Get your kundali, consult astrologers, book pujas</span>
            </button>
            <button type="button" className={`role-choice ${role === "astrologer" ? "active" : ""}`} onClick={() => setRole("astrologer")}>
              <span className="role-choice-icon">🔮</span>
              <span className="role-choice-title">I&apos;m an Astrologer</span>
              <span className="role-choice-desc">Join our panel and start consulting customers</span>
            </button>
          </div>
          <button className="btn btn-primary" style={{ width: "100%", marginTop: 20 }} disabled={!role} onClick={goNext}>
            Continue
          </button>
        </div>
      )}

      {step === "name" && (
        <div className="card onboarding-card">
          <h2 style={{ marginBottom: 6 }}>What should we call you?</h2>
          <p style={{ color: "var(--ink-soft)", marginBottom: 20 }}>Just your name for now — you can add more details later.</p>
          <div className="field">
            <label htmlFor="ob-name">Full Name</label>
            <input id="ob-name" required value={name} placeholder="e.g. Priya Sharma" onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button className="btn btn-outline" onClick={goBack}>Back</button>
            <button className="btn btn-primary" style={{ flex: 1 }} disabled={!name.trim()} onClick={goNext}>Continue</button>
          </div>
        </div>
      )}

      {step === "address" && (
        <div className="card onboarding-card">
          <h2 style={{ marginBottom: 6 }}>Where should we deliver prasad?</h2>
          <p style={{ color: "var(--ink-soft)", marginBottom: 20 }}>Optional — add this anytime from your account.</p>
          <div className="field">
            <label htmlFor="ob-city">City</label>
            <PlaceAutocomplete id="ob-city" value={city} placeholder="Start typing a city…" onChange={setCity} />
          </div>
          <div className="field">
            <label htmlFor="ob-line1">Address</label>
            <input id="ob-line1" value={line1} placeholder="House / street / landmark" onChange={(e) => setLine1(e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button className="btn btn-outline" onClick={goBack}>Back</button>
            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => { setAddressSkipped(true); goNext(); }}>Skip</button>
            <button className="btn btn-primary" style={{ flex: 1 }} disabled={!line1 || !city} onClick={goNext}>Save &amp; Continue</button>
          </div>
        </div>
      )}

      {step === "plan" && (
        <div className="card onboarding-card">
          <h2 style={{ marginBottom: 6 }}>Choose your plan</h2>
          <p style={{ color: "var(--ink-soft)", marginBottom: 20 }}>You can change this anytime from your account.</p>
          <div style={{ display: "grid", gap: 12 }}>
            {PLUS_PLANS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`onboarding-plan-choice ${plan === (p.id === "plus" ? "plus" : "free") ? "active" : ""}`}
                onClick={() => setPlan(p.id === "plus" ? "plus" : "free")}
              >
                <div className="onboarding-plan-head">
                  <span className="onboarding-plan-name">{p.name}</span>
                  <span className="onboarding-plan-price">{p.pricePerYear === 0 ? "Free" : `₹${p.pricePerYear}/yr`}</span>
                </div>
                <ul>
                  {p.features.slice(0, 3).map((f) => <li key={f}>{f}</li>)}
                </ul>
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button className="btn btn-outline" onClick={goBack}>Back</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={goNext}>Continue</button>
          </div>
        </div>
      )}

      {step === "wallet" && (
        <div className="card onboarding-card">
          <h2 style={{ marginBottom: 6 }}>Set up your wallet</h2>
          <p style={{ color: "var(--ink-soft)", marginBottom: 4 }}>
            Optional — add money now for instant, uninterrupted consultations.
          </p>
          <div className="wallet-benefit-row">
            <span className="wallet-benefit-star" tabIndex={0}>
              ⭐
              <span className="wallet-benefit-tooltip">
                💫 Uninterrupted calls — never get cut off mid-consultation.<br />
                🎁 Get 50% cashback on your first top-up, up to ₹100!
              </span>
            </span>
            <span className="opt">Hover the star to see your first top-up bonus</span>
          </div>

          <div className="topup-options">
            {TOPUP_OPTIONS.map((amt) => (
              <button key={amt} type="button" className={`topup-chip ${topup === amt ? "active" : ""}`} onClick={() => setTopup(amt)}>
                ₹{amt}
                {plan === "plus" && <span className="topup-cashback">+₹{Math.min(100, Math.round(amt * 0.5))} back</span>}
              </button>
            ))}
          </div>
          {plan === "plus" && !topup && (
            <p className="city-note ok" style={{ marginTop: 10 }}>
              ✨ Since you chose Plus, we recommend adding money now — your first top-up gets 50% cashback (up to ₹100).
            </p>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button className="btn btn-outline" onClick={goBack} disabled={submitting}>Back</button>
            <button className="btn btn-outline" style={{ flex: 1 }} disabled={submitting} onClick={() => finish(null)}>
              Skip for now
            </button>
            <button className="btn btn-primary" style={{ flex: 1 }} disabled={submitting || !topup} onClick={() => finish(topup)}>
              {submitting ? "Setting up…" : "Add & Finish"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
