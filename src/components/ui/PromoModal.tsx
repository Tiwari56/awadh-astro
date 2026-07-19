"use client";

import { useEffect, useState } from "react";

export default function PromoModal() {
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoShownCount, setPromoShownCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setPromoShownCount((prev) => {
          if (prev === 0) {
            setShowPromoModal(true);
            return 1;
          }
          return prev;
        });
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!showPromoModal && promoShownCount > 0 && promoShownCount < 3) {
      const timer = setTimeout(() => {
        setShowPromoModal(true);
        setPromoShownCount((prev) => prev + 1);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [showPromoModal, promoShownCount]);

  if (!showPromoModal) return null;

  return (
    <div className="promo-modal-overlay" onClick={() => setShowPromoModal(false)}>
      <div className="promo-modal" onClick={(e) => e.stopPropagation()}>
        <button className="promo-modal-close" onClick={() => setShowPromoModal(false)}>✕</button>
        <div className="promo-modal-image">
          <img src="/images/promo.jpg" alt="Get first consultation free" />
        </div>
        <div className="promo-modal-content">
          <h3>Get First Consultation</h3>
          <div className="promo-free-text">FREE</div>
          <button className="btn btn-consult" onClick={() => setShowPromoModal(false)}>CONSULT NOW</button>
          <p className="promo-disclaimer">* Valid for first consultation</p>
        </div>
      </div>
    </div>
  );
}
