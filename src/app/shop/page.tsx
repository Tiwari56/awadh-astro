"use client";

import { useState } from "react";
import { SPIRITUAL_PRODUCTS } from "@/lib/data/products";

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "gemstone", label: "Gemstones" },
  { id: "rudraksh", label: "Rudraksh" },
  { id: "yantra", label: "Yantras" },
  { id: "other", label: "Other" },
] as const;

export default function ShopPage() {
  const [category, setCategory] = useState<string>("all");
  const [added, setAdded] = useState<string | null>(null);

  const products = category === "all" ? SPIRITUAL_PRODUCTS : SPIRITUAL_PRODUCTS.filter((p) => p.category === category);

  return (
    <div className="container section">
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ marginBottom: 6 }}>Spiritual Shop</h1>
        <p style={{ color: "var(--ink-soft)" }}>
          Certified gemstones, rudraksh and yantras recommended by your kundali. This is a preview catalog — full checkout is coming soon.
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            className={`topup-chip ${category === c.id ? "active" : ""}`}
            style={{ flex: "0 0 auto", padding: "8px 16px", minWidth: "auto" }}
            onClick={() => setCategory(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
        {products.map((p) => (
          <div key={p.id} className="card">
            <div style={{ fontSize: "2.5rem", textAlign: "center", marginBottom: 10 }}>{p.image}</div>
            <h4 style={{ marginBottom: 4 }}>{p.name}</h4>
            <p style={{ color: "var(--ink-soft)", fontSize: "0.85rem", marginBottom: 10, minHeight: 40 }}>{p.benefit}</p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 700 }}>₹{p.priceINR.toLocaleString("en-IN")}</span>
              <button className="btn btn-outline btn-sm" onClick={() => setAdded(p.id)}>
                {added === p.id ? "Added ✓" : "Add to Cart"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <p style={{ color: "var(--ink-soft)", fontSize: "0.85rem", marginTop: 24, textAlign: "center" }}>
        🛒 Cart &amp; checkout are coming in a future update — for now, contact support to order.
      </p>
    </div>
  );
}
