import { PLUS_PLANS } from "@/lib/plans";

export default function PlusPage() {
  return (
    <div className="container section">
      <h2>Awadh Plus</h2>
      <p style={{ marginBottom: 28, color: "#4b5563", maxWidth: 640 }}>
        Your kundali, working for you every day. Plus members receive proactive notifications —
        auspicious muhurat for purchases and new ventures, caution days to avoid, and monthly
        personalized reports.
      </p>

      <div className="plans">
        {PLUS_PLANS.map((plan) => (
          <div key={plan.id} className={`card plan ${plan.highlighted ? "highlighted" : ""}`}>
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
            <button className={`btn ${plan.highlighted ? "btn-primary" : "btn-outline"}`}>
              {plan.pricePerYear === 0 ? "Current Plan" : "Subscribe — ₹999/yr"}
            </button>
          </div>
        ))}
      </div>

      <p style={{ marginTop: 24, fontSize: "0.8rem", color: "#6b7280" }}>
        Payments will be processed via Razorpay (UPI, cards, net banking). Cancel anytime.
      </p>
    </div>
  );
}
