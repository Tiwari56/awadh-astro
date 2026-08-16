"use client";

import { PLUS_PLANS } from "@/lib/data/plans";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function PlusPage() {
  const { t } = useLanguage();
  const p = t.plus;
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
            <button className="btn btn-primary" style={{ width: "100%", marginTop: "auto" }}>
              {plan.pricePerYear === 0 ? p.currentPlan : `${p.subscribe} — ₹999/yr`}
            </button>
          </div>
        ))}
      </div>

      <p style={{ marginTop: 40, fontSize: "0.85rem", color: "var(--muted)", textAlign: "center" }}>
        {p.paymentNote}
      </p>
    </div>
  );
}
