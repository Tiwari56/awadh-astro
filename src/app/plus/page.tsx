import { PLUS_PLANS } from "@/lib/plans";

export default function PlusPage() {
  return (
    <div className="container section">
      <h2 style={{ textAlign: "center", marginBottom: 24 }}>Awadh Plus</h2>
      <p style={{ margin: "0 auto 40px", color: "rgba(255,255,255,0.7)", maxWidth: 640, textAlign: "center", lineHeight: 1.6 }}>
        Your kundali, working for you every day. Plus members receive proactive notifications —
        auspicious muhurat for purchases and new ventures, caution days to avoid, and monthly
        personalized reports.
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
            <button className={`btn ${plan.highlighted ? "btn-primary" : "btn-primary"}`} style={{ width: "100%", marginTop: "auto" }}>
              {plan.pricePerYear === 0 ? "Current Plan" : "Subscribe — ₹999/yr"}
            </button>
          </div>
        ))}
      </div>

      <p style={{ marginTop: 40, fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", textAlign: "center" }}>
        Payments will be processed via Razorpay (UPI, cards, net banking). Cancel anytime.
      </p>
    </div>
  );
}
