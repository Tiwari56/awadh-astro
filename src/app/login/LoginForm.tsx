"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

const PHONE_RE = /^[0-9]{10}$/;

export default function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function requestOtp(e: FormEvent) {
    e.preventDefault();
    if (!PHONE_RE.test(phone)) {
      setError("Enter a 10-digit mobile number");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `+91${phone}` }),
      });
      const data = (await res.json()) as { ok?: boolean; devCode?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not send OTP");
      setDevCode(data.devCode ?? null);
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await signIn("phone-otp", { phone: `+91${phone}`, code, redirect: false });
      if (res?.error) {
        setError("Incorrect or expired code — please try again");
        return;
      }
      // Fresh onboarding status lives on the session; ask the server for it.
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      if (session?.user?.onboarded) {
        router.push(callbackUrl);
      } else {
        router.push(`/onboarding?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      }
      router.refresh();
    } catch {
      setError("Something went wrong — please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container section" style={{ maxWidth: 420 }}>
      <div className="card auth-card">
        <div className="auth-om">ॐ</div>
        <h2 style={{ textAlign: "center", marginBottom: 6 }}>Welcome to Awadh Astro</h2>
        <p style={{ textAlign: "center", color: "var(--ink-soft)", fontSize: "0.88rem", marginBottom: 24 }}>
          Sign in to save your kundali, book sevas, and get personalized guidance.
        </p>

        {step === "phone" && (
          <form onSubmit={requestOtp} className="form">
            <div className="field">
              <label htmlFor="phone">Mobile Number</label>
              <div className="phone-input-row">
                <span className="phone-prefix">🇮🇳 +91</span>
                <input
                  id="phone" type="tel" inputMode="numeric" required maxLength={10}
                  placeholder="98765 43210" value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                />
              </div>
            </div>
            {error && <p style={{ color: "var(--danger)", fontSize: "0.85rem" }}>{error}</p>}
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Sending…" : "Send OTP"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={verifyOtp} className="form">
            <div className="field">
              <label htmlFor="code">Enter the 6-digit code sent to +91 {phone}</label>
              <input id="code" inputMode="numeric" required maxLength={6} placeholder="123456"
                value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                style={{ letterSpacing: "0.3em", textAlign: "center", fontSize: "1.2rem" }} />
              {devCode && (
                <p className="city-note ok" style={{ marginTop: 8 }}>
                  🛠 Dev mode — no SMS provider configured yet. Your code is <strong>{devCode}</strong>.
                </p>
              )}
            </div>
            {error && <p style={{ color: "var(--danger)", fontSize: "0.85rem" }}>{error}</p>}
            <button className="btn btn-primary" type="submit" disabled={loading || code.length !== 6}>
              {loading ? "Verifying…" : "Verify & Continue"}
            </button>
            <button type="button" className="link-back" style={{ marginBottom: 0 }} onClick={() => { setStep("phone"); setCode(""); setError(null); }}>
              ← Change number
            </button>
          </form>
        )}

        <div className="divider"><span className="di" /></div>

        <div className="social-login-list">
          {googleEnabled ? (
            <button type="button" className="btn btn-outline social-btn" onClick={() => signIn("google")}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.85A11 11 0 0 0 12 23z" /><path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.05H2.18A11 11 0 0 0 1 12c0 1.77.43 3.45 1.18 4.95l3.66-2.85z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.85C6.71 7.3 9.14 5.38 12 5.38z" /></svg>
              Continue with Google
            </button>
          ) : (
            <button type="button" className="btn btn-outline social-btn" disabled title="Being set up">
              Continue with Google <span className="coming-soon-badge">Coming Soon</span>
            </button>
          )}
          <button type="button" className="btn btn-outline social-btn" disabled title="Coming soon">
            Continue with Facebook <span className="coming-soon-badge">Coming Soon</span>
          </button>
          <button type="button" className="btn btn-outline social-btn" disabled title="Coming soon">
            Continue with Apple <span className="coming-soon-badge">Coming Soon</span>
          </button>
        </div>

        <p className="opt" style={{ textAlign: "center", marginTop: 18 }}>
          By continuing you agree this guidance is spiritual/informational only.
        </p>
      </div>
    </div>
  );
}
