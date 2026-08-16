"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getBookings, BOOKING_STAGES, type Booking, type BookingStatus } from "@/lib/bookings";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { Dictionary } from "@/lib/i18n/dictionary";

const STATUS_LABEL_KEY: Record<BookingStatus, keyof Dictionary["tracking"]> = {
  requested: "statusRequested",
  muhurat_confirmed: "statusMuhuratConfirmed",
  performed: "statusPerformed",
  prasad_shipped: "statusPrasadShipped",
  delivered: "statusDelivered",
};

function StatusTracker({ status, t }: { status: BookingStatus; t: Dictionary["tracking"] }) {
  const currentIndex = BOOKING_STAGES.indexOf(status);
  return (
    <div className="status-tracker">
      {BOOKING_STAGES.map((stage, i) => (
        <div key={stage} className={`status-step ${i <= currentIndex ? "done" : ""} ${i === currentIndex ? "current" : ""}`}>
          <span className="status-dot-lg" />
          <span className="status-label">{t[STATUS_LABEL_KEY[stage]]}</span>
        </div>
      ))}
    </div>
  );
}

export default function BookingsPage() {
  const { t } = useLanguage();
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    setBookings(getBookings());
  }, []);

  return (
    <div className="container section">
      <Link href="/seva" className="link-back">← {t.seva.pageTitle}</Link>
      <h2>{t.tracking.pageTitle}</h2>

      {bookings.length === 0 ? (
        <p style={{ color: "var(--ink-soft)", padding: "20px 0" }}>{t.tracking.empty}</p>
      ) : (
        <div className="grid grid-2" style={{ marginTop: 20 }}>
          {bookings.map((b) => (
            <div key={b.id} className="card booking-card">
              <div className="booking-head">
                <div>
                  <div className="booking-name">{b.pujaName}</div>
                  <div className="booking-devotee">{b.devoteeName}</div>
                </div>
                <div className="booking-amount">₹{b.amountINR.toLocaleString("en-IN")}</div>
              </div>
              <div className="booking-date">{t.tracking.bookedOn} {new Date(b.createdAt).toLocaleDateString()}</div>
              <StatusTracker status={b.status} t={t.tracking} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
