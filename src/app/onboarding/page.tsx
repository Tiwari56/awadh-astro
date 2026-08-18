"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import PlaceAutocomplete from "@/components/ui/PlaceAutocomplete";
import { PLUS_PLANS } from "@/lib/data/plans";

type Step = "role" | "name" | "address" | "plan" | "wallet";
const STEPS: Step[] = ["role", "name", "address", "plan", "wallet"];

const TOPUP_OPTIONS = [200, 500, 1000];

const STEP_LABEL: Record<Step, string> = {
  role: "Who you are",
  name: "Your name",
  address: "Prasad delivery",
  plan: "Choose a plan",
  wallet: "Wallet setup",
};

function OnboardingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
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
      // Refresh the JWT without a full re-login — include name so the header
      // avatar shows initials right away instead of a "?" until next sign-in.
      await update({ onboarded: true, role, name, plan });
      router.push(callbackUrl);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container section" style={{ maxWidth: 480 }}>
      <div className="ob-head">
        <div className="ob-rail" role="progressbar" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={stepIndex + 1}>
          <span className="ob-rail-fill" style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }} />
        </div>
        <div className="ob-steplabel">
          <span>{STEP_LABEL[step]}</span>
          <span className="ob-count">{stepIndex + 1} / {STEPS.length}</span>
        </div>
      </div>

      {step === "role" && (
        <div className="card-v2 card-gilded onboarding-card rise">
          <span className="eyebrow">Step one</span>
          <h2 className="ob-title">Aapka swagat hai 🙏</h2>
          <p className="ob-sub">Ayodhya ki parampara, aapke haath mein. Tell us how you&apos;ll be using Awadh Astro.</p>
          <div className="ob-choices">
            <button type="button" aria-pressed={role === "user"} className="opt-card" onClick={() => setRole("user")}>
              <span className="opt-check">✓</span>
              <span className="opt-ic" aria-hidden="true">🪔</span>
              <span className="opt-body">
                <span className="opt-title">I&apos;m a Devotee</span>
                <span className="opt-desc">Free kundali, consult astrologers, book puja at Ayodhya temples</span>
              </span>
            </button>
            <button type="button" aria-pressed={role === "astrologer"} className="opt-card" onClick={() => setRole("astrologer")}>
              <span className="opt-check">✓</span>
              <span className="opt-ic" aria-hidden="true">🔮</span>
              <span className="opt-body">
                <span className="opt-title">I&apos;m an Astrologer</span>
                <span className="opt-desc">Join our verified panel and earn by guiding devotees</span>
              </span>
            </button>
          </div>
          <div className="ob-actions">
            <button className="btn btn-primary ob-primary" disabled={!role} onClick={goNext}>Continue</button>
          </div>
        </div>
      )}

      {step === "name" && (
        <div className="card-v2 card-gilded onboarding-card rise">
          <span className="eyebrow">Step two</span>
          <h2 className="ob-title">What should we call you?</h2>
          <p className="ob-sub">Your name is used in the sankalp when a pandit performs puja on your behalf.</p>
          <div className="field-v2">
            <label htmlFor="ob-name">Full Name</label>
            <input id="ob-name" className="input-v2" required value={name} placeholder="e.g. Priya Sharma" onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button className="btn btn-outline" onClick={goBack}>Back</button>
            <button className="btn btn-primary" style={{ flex: 1 }} disabled={!name.trim()} onClick={goNext}>Continue</button>
          </div>
        </div>
      )}

      {step === "address" && (
        <div className="card-v2 card-gilded onboarding-card rise">
          <span className="eyebrow">Step three</span>
          <h2 className="ob-title">Where should prasad reach you?</h2>
          <p className="ob-sub">Blessed prasad is couriered from the temple after your puja. You can add this later.</p>
          <div className="field-v2">
            <label htmlFor="ob-city">City</label>
            <PlaceAutocomplete id="ob-city" value={city} placeholder="Start typing a city…" onChange={setCity} />
          </div>
          <div className="field-v2">
            <label htmlFor="ob-line1">Address</label>
            <input id="ob-line1" className="input-v2" value={line1} placeholder="House / street / landmark" onChange={(e) => setLine1(e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button className="btn btn-outline" onClick={goBack}>Back</button>
            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => { setAddressSkipped(true); goNext(); }}>Skip</button>
            <button className="btn btn-primary" style={{ flex: 1 }} disabled={!line1 || !city} onClick={goNext}>Save &amp; Continue</button>
          </div>
        </div>
      )}

      {step === "plan" && (
        <div className="card-v2 card-gilded onboarding-card rise">
          <span className="eyebrow">Step four</span>
          <h2 className="ob-title">Choose your path</h2>
          <p className="ob-sub">Start free forever, or unlock daily guidance. Change it anytime.</p>
          <div className="ob-choices">
            {PLUS_PLANS.map((p) => {
              const val = p.id === "plus" ? "plus" : "free";
              return (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={plan === val}
                  className="opt-card ob-plan"
                  onClick={() => setPlan(val)}
                >
                  <span className="opt-check">✓</span>
                  <span className="opt-body">
                    <span className="ob-plan-head">
                      <span className="opt-title">{p.name}</span>
                      <span className="ob-plan-price">{p.pricePerYear === 0 ? "Free" : `₹${p.pricePerYear}`}<small>{p.pricePerYear === 0 ? "" : "/yr"}</small></span>
                    </span>
                    <span className="ob-plan-feats">
                      {p.features.slice(0, 3).map((f) => <span key={f} className="ob-feat">✦ {f}</span>)}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button className="btn btn-outline" onClick={goBack}>Back</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={goNext}>Continue</button>
          </div>
        </div>
      )}

      {step === "wallet" && (
        <div className="card-v2 card-gilded onboarding-card rise">
          <span className="eyebrow">Last step</span>
          <h2 className="ob-title">Set up your wallet</h2>
          <p className="ob-sub">Optional — a funded wallet means your call never cuts off mid-consultation.</p>
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

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingForm />
    </Suspense>
  );
}
