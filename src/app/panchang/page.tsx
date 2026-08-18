"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { vedic } from "@/lib/i18n/vedic-terms";

interface DayPanchang {
  date: string;
  vara: string;
  tithi: string;
  paksha: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  sunrise: string;
  sunset: string;
  source: "mock" | "prokerala";
}

const WEEKDAYS_EN = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const WEEKDAYS_HI = ["र", "सो", "मं", "बु", "गु", "शु", "श"];
const MONTHS_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTHS_HI = [
  "जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून",
  "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर",
];

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** The handful of facts that answer "what's today's panchang" at a glance, before any scrolling. */
function GlanceRow({ data, hi, tr }: { data: DayPanchang; hi: boolean; tr: Record<string, string> }) {
  return (
    <div className="pan-glance">
      <div className="pg-item"><span className="pg-l">{tr.tithi}</span><span className="pg-v">{hi ? vedic.tithi(data.tithi) : data.tithi}</span></div>
      <div className="pg-item"><span className="pg-l">{tr.nakshatra}</span><span className="pg-v">{hi ? vedic.nakshatra(data.nakshatra) : data.nakshatra}</span></div>
      <div className="pg-item"><span className="pg-l">{tr.yoga}</span><span className="pg-v">{data.yoga}</span></div>
      <div className="pg-item"><span className="pg-l">{tr.karana}</span><span className="pg-v">{hi ? vedic.karana(data.karana) : data.karana}</span></div>
    </div>
  );
}

export default function PanchangPage() {
  const { locale } = useLanguage();
  const hi = locale === "hi";

  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<string>(() => iso(today));
  const [data, setData] = useState<DayPanchang | null>(null);
  const [loading, setLoading] = useState(true);

  const cells = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const out: (string | null)[] = Array(firstWeekday).fill(null);
    for (let d = 1; d <= daysInMonth; d++) out.push(iso(new Date(year, month, d)));
    return out;
  }, [cursor]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/panchang?date=${selected}`)
      .then((r) => r.json())
      .then((d: DayPanchang) => { if (!cancelled) setData(d); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [selected]);

  const shiftMonth = (delta: number) =>
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));

  const weekdays = hi ? WEEKDAYS_HI : WEEKDAYS_EN;
  const months = hi ? MONTHS_HI : MONTHS_EN;
  const tr = {
    tithi: hi ? "तिथि" : "Tithi", vara: hi ? "वार" : "Vara", nakshatra: hi ? "नक्षत्र" : "Nakshatra",
    yoga: hi ? "योग" : "Yoga", karana: hi ? "करण" : "Karana", paksha: hi ? "पक्ष" : "Paksha",
    sunrise: hi ? "सूर्योदय" : "Sunrise", sunset: hi ? "सूर्यास्त" : "Sunset",
  };

  return (
    <div className="container section pan-page">
      <span className="eyebrow">Daily almanac</span>
      <h2 style={{ margin: "6px 0 14px" }}>{hi ? "पंचांग" : "Panchang Calendar"}</h2>

      <div className="pan-layout">
        {/* ── Detail: leads on mobile (the answer, not the picker), sits beside the calendar on desktop ── */}
        <div className="card-v2 pan-detail rise">
          <div className="pan-detail-head">
            <h3>
              {new Date(`${selected}T00:00:00`).toLocaleDateString(hi ? "hi-IN" : "en-IN", {
                weekday: "long", day: "numeric", month: "long",
              })}
              {selected === iso(today) && <span className="pan-today-tag">{hi ? "आज" : "Today"}</span>}
            </h3>
            {data?.source === "mock" && <span className="chip-role">Sample data</span>}
          </div>

          {loading ? (
            <div className="pan-glance">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 50 }} />)}</div>
          ) : data ? (
            <>
              <GlanceRow data={data} hi={hi} tr={tr} />
              <div className="pan-grid-sm">
                <div className="stat-v2"><span className="sl">{tr.paksha}</span><span className="sv pan-v">{data.paksha}</span></div>
                <div className="stat-v2"><span className="sl">{tr.vara}</span><span className="sv pan-v">{hi ? vedic.vara(data.vara) : data.vara}</span></div>
                <div className="stat-v2"><span className="sl">{tr.sunrise}</span><span className="sv pan-v">{data.sunrise}</span></div>
                <div className="stat-v2"><span className="sl">{tr.sunset}</span><span className="sv pan-v">{data.sunset}</span></div>
              </div>
            </>
          ) : (
            <p style={{ color: "var(--ink-soft)" }}>Could not load panchang for this date.</p>
          )}

          <div className="pan-cta">
            <Link href="/seva" className="btn btn-primary btn-sm">{hi ? "इस तिथि पर पूजा बुक करें" : "Book a puja on this date"}</Link>
            <Link href="/kundali" className="btn btn-outline btn-sm">{hi ? "अपनी कुंडली प्राप्त करें" : "Get your kundali"}</Link>
          </div>
        </div>

        {/* ── Calendar: compact, small cells, no wasted padding ── */}
        <div className="cal-card card-v2 card-gilded">
          <div className="cal-head">
            <button className="cal-nav" onClick={() => shiftMonth(-1)} aria-label="Previous month">‹</button>
            <span className="cal-title">{months[cursor.getMonth()]} {cursor.getFullYear()}</span>
            <button className="cal-nav" onClick={() => shiftMonth(1)} aria-label="Next month">›</button>
          </div>
          <div className="cal-grid cal-weekdays" role="row">
            {weekdays.map((w, i) => <span key={i} className="cal-wd">{w}</span>)}
          </div>
          <div className="cal-grid">
            {cells.map((d, i) =>
              d === null ? (
                <span key={`b${i}`} className="cal-cell cal-blank" />
              ) : (
                <button
                  key={d}
                  type="button"
                  className={`cal-cell${d === selected ? " is-selected" : ""}${d === iso(today) ? " is-today" : ""}`}
                  aria-pressed={d === selected}
                  onClick={() => setSelected(d)}
                >
                  {Number(d.slice(8, 10))}
                </button>
              )
            )}
          </div>
          <button type="button" className="cal-today-btn" onClick={() => { setCursor(new Date(today.getFullYear(), today.getMonth(), 1)); setSelected(iso(today)); }}>
            {hi ? "आज पर जाएं" : "Jump to today"}
          </button>
        </div>
      </div>
    </div>
  );
}
