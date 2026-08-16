"use client";

import { useEffect, useState } from "react";

const SESSION_KEY = "awadh-promo-shown";
const MIN_DWELL_MS = 6000; // don't interrupt someone who just landed
const SCROLL_TRIGGER_PX = 900; // only once they've actually engaged with the page

/**
 * Shows the first-consultation promo at most ONCE per browser session, and
 * not before the visitor has spent a few seconds on the page AND scrolled a
 * meaningful distance — earlier this fired almost immediately at 400px of
 * scroll and then kept re-showing every 10s, which read as spammy.
 */
export default function PromoModal() {
  const [showPromoModal, setShowPromoModal] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;

    const loadedAt = Date.now();
    let dwellOk = false;
    const dwellTimer = setTimeout(() => { dwellOk = true; }, MIN_DWELL_MS);

    function reveal() {
      if (sessionStorage.getItem(SESSION_KEY)) return;
      sessionStorage.setItem(SESSION_KEY, "1");
      setShowPromoModal(true);
      window.removeEventListener("scroll", handleScroll);
    }

    function handleScroll() {
      if (window.scrollY < SCROLL_TRIGGER_PX) return;
      if (dwellOk || Date.now() - loadedAt > MIN_DWELL_MS) reveal();
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      clearTimeout(dwellTimer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (!showPromoModal) return null;

  return (
    <div className="promo-modal-overlay" onClick={() => setShowPromoModal(false)}>
      <div className="promo-modal" onClick={(e) => e.stopPropagation()}>
        <button className="promo-modal-close" onClick={() => setShowPromoModal(false)} aria-label="Close">✕</button>
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
