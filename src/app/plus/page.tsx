"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { PLUS_PLANS } from "@/lib/data/plans";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function PlusPage() {
  const { t } = useLanguage();
  const p = t.plus;
  const router = useRouter();
  const { status } = useSession();
  const [notice, setNotice] = useState<string | null>(null);

  function onSubscribe() {
    if (status !== "authenticated") {
      router.push("/login?callbackUrl=/plus");
      return;
    }
    setNotice("Online payments are launching soon — for now, contact support@awadhastro.com to activate Plus.");
  }

  return (
    <div className="container section">
      <h2 style={{ textAlign: "center", marginBottom: 24 }}>{p.pageTitle}</h2>
      <p style={{ margin: "0 auto 40px", color: "var(--ink-soft)", maxWidth: 640, textAlign: "center", lineHeight: 1.6 }}>
        {p.subtitle} Plus members receive proactive notifications — auspicious muhurat for
        purchases and new ventures, caution days to avoid, and monthly personalized reports.
      </p>

      <div className="plus-plans">
        {PLUS_PLANS.map((plan) => (
          <div key={plan.id} className={`plus-plan ${plan.highlighted ? "highlighted" : ""}`}>
            {plan.highlighted && <span className="plan-badge">MOST POPULAR</span>}
            <h3>{plan.name}</h3>
            <div className="price">
              {plan.pricePerYear === 0 ? "₹0" : `₹${plan.pricePerYear}`}
              <small>/year</small>
            </div>
            <ul>
              {plan.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <button
              className="btn btn-primary"
              style={{ width: "100%", marginTop: "auto" }}
              disabled={plan.pricePerYear === 0}
              onClick={onSubscribe}
            >
              {plan.pricePerYear === 0 ? p.currentPlan : `${p.subscribe} — ₹999/yr`}
            </button>
          </div>
        ))}
      </div>

      {notice && <p className="city-note ok" style={{ maxWidth: 480, margin: "20px auto 0", textAlign: "center" }}>{notice}</p>}

      <p style={{ marginTop: 40, fontSize: "0.85rem", color: "var(--muted)", textAlign: "center" }}>
        {p.paymentNote}
      </p>
    </div>
  );
}
