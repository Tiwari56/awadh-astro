"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import PlaceAutocomplete from "@/components/ui/PlaceAutocomplete";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { kootaBand, kootaMeaning, kootaSummary, scoreGuidance } from "@/lib/astrology/matching";
import type { MatchPerson, MatchResult } from "@/lib/astrology/matching";

const EMPTY: MatchPerson = { name: "", dateOfBirth: "", timeOfBirth: "", placeOfBirth: "", timeUnknown: false };

function PersonFields({
  role,
  hindi,
  value,
  onChange,
  t,
}: {
  role: string;
  hindi: string;
  value: MatchPerson;
  onChange: (v: MatchPerson) => void;
  t: Dictionary["match"];
}) {
  const set = <K extends keyof MatchPerson>(k: K, v: MatchPerson[K]) => onChange({ ...value, [k]: v });
  const id = role.toLowerCase();
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <div className="card" style={{ display: "grid", gap: 14 }}>
      <div className="mp-role">
        {role} · <span className="hi">{hindi}</span>
      </div>
      <div className="field">
        <label htmlFor={`${id}-n`}>Full Name</label>
        <input id={`${id}-n`} required value={value.name} placeholder="e.g. Aditi Sharma" onChange={(e) => set("name", e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor={`${id}-d`}>Date of Birth</label>
        <input id={`${id}-d`} type="date" required value={value.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor={`${id}-t`}>Time of Birth</label>
        <input id={`${id}-t`} type="time" required={!value.timeUnknown} disabled={value.timeUnknown}
          value={value.timeUnknown ? "" : value.timeOfBirth} onChange={(e) => set("timeOfBirth", e.target.value)} />
        <label className="checkbox-row" style={{ marginTop: 8 }}>
          <input type="checkbox" checked={value.timeUnknown ?? false} onChange={(e) => set("timeUnknown", e.target.checked)} />
          <span>Exact birth time unknown</span>
        </label>
      </div>
      <div className="field">
        <label htmlFor={`${id}-p`}>Place of Birth</label>
        <PlaceAutocomplete id={`${id}-p`} required value={value.placeOfBirth}
          placeholder="Start typing a city…" onChange={(v) => set("placeOfBirth", v)} />
      </div>
      <div className="field">
        <label htmlFor={`${id}-f`}>{t.uploadLabel} <span className="opt">(optional, image or PDF)</span></label>
        {!fileName ? (
          <label className="upload-drop" htmlFor={`${id}-f`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" /></svg>
            <span>{t.uploadCta}</span>
          </label>
        ) : (
          <div className="upload-chip">
            <span>📄 {fileName}</span>
            <button type="button" onClick={() => setFileName(null)} aria-label="Remove file">✕</button>
          </div>
        )}
        <input
          id={`${id}-f`} type="file" accept="image/*,.pdf" style={{ display: "none" }}
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
        />
        <p className="opt" style={{ marginTop: 4 }}>{t.uploadNote}</p>
      </div>
    </div>
  );
}

export default function MatchPage() {
  const { t, locale } = useLanguage();
  const m = t.match;
  const { data: session } = useSession();
  const isAstrologer = session?.user?.role === "astrologer";
  const [bride, setBride] = useState<MatchPerson>(EMPTY);
  const [groom, setGroom] = useState<MatchPerson>(EMPTY);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bride, groom, locale }),
      });
      if (!res.ok) throw new Error("Could not compute the match. Please try again.");
      setResult((await res.json()) as MatchResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container section">
      <h2>{isAstrologer ? "Match Customer Kundalis" : m.pageTitle}</h2>
      <p style={{ color: "var(--ink-soft)", marginBottom: 22 }}>
        {m.subtitle} <span className="hi">गुण मिलान</span>
      </p>

      {!result && (
        <details className="guide-card">
          <summary>{m.guideToggle} <span className="opt">— tap to read the guide</span></summary>
          <div className="guide-body">
            <p>{m.guideIntro}</p>
            <ul>
              <li><b>Varna &amp; Vashya</b> — spiritual temperament and mutual influence.</li>
              <li><b>Tara</b> — health and general fortune as a couple.</li>
              <li><b>Yoni</b> — physical and intimate compatibility.</li>
              <li><b>Graha Maitri</b> — mental and intellectual bonding.</li>
              <li><b>Gana</b> — temperament match (calm, active or fierce natures).</li>
              <li><b>Bhakoot</b> — love, finances and family welfare.</li>
              <li><b>Nadi</b> — genetic health of future children; the single most heavily weighted koota.</li>
            </ul>
            <p><b>{m.howToRead}</b></p>
            <p className="opt">{m.guideFooter}</p>
          </div>
        </details>
      )}

      {!result && (
        <form onSubmit={onSubmit}>
          <div className="grid grid-2" style={{ marginBottom: 18 }}>
            <PersonFields role={m.bride} hindi={m.brideHi} value={bride} onChange={setBride} t={m} />
            <PersonFields role={m.groom} hindi={m.groomHi} value={groom} onChange={setGroom} t={m} />
          </div>
          {error && <p style={{ color: "var(--danger)", fontSize: "0.9rem", marginBottom: 14 }}>{error}</p>}
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ minWidth: 220 }}>
            {loading ? m.matching : m.matchButton}
          </button>
        </form>
      )}

      {result && (
        <div>
          <div className="match-pair">
            <div className="mp">
              <div className="mp-av">{(bride.name || "V")[0].toUpperCase()}</div>
              <div className="mp-role">{m.bride} · <span className="hi">{m.brideHi}</span></div>
              <div className="mp-name">{bride.name || m.bride}</div>
              <div className="mp-dt">{bride.dateOfBirth} · {bride.placeOfBirth}</div>
            </div>
            <div className="match-vs">✦</div>
            <div className="mp">
              <div className="mp-av">{(groom.name || "V")[0].toUpperCase()}</div>
              <div className="mp-role">{m.groom} · <span className="hi">{m.groomHi}</span></div>
              <div className="mp-name">{groom.name || m.groom}</div>
              <div className="mp-dt">{groom.dateOfBirth} · {groom.placeOfBirth}</div>
            </div>
          </div>

          {/* Traditional framing first (gunas out of 36), percentage second —
              the guna count is what families and astrologers actually quote. */}
          <div className="score-panel card-v2 card-gilded">
            <div className="gauge" style={{ ["--pct" as string]: result.percent }}>
              <div className="gauge-in">
                <div className="gauge-pct">{result.totalGot}<small>/{result.totalMax}</small></div>
                <div className="gauge-of">{m.guna}</div>
              </div>
            </div>
            <div className="score-side">
              <span className={`score-verdict band-${result.totalGot >= 25 ? "strong" : result.totalGot >= 18 ? "moderate" : "weak"}`}>
                ✦ {result.verdict}
              </span>
              <p className="score-guidance">{scoreGuidance(result.totalGot)}</p>
              <div className="score-scale" aria-hidden="true">
                <span className="ss-bar"><i style={{ width: `${(result.totalGot / result.totalMax) * 100}%` }} /></span>
                <span className="ss-marks"><b style={{ left: `${(18 / 36) * 100}%` }}>18 — classical minimum</b></span>
              </div>
              <span className="score-pct">{result.percent}{m.percentOf} compatibility</span>
            </div>
          </div>

          <div className="divider"><span className="di" /></div>
          <h3 className="kundali-section-title">{m.ashtakootBreakdown}</h3>
          <div className="koota-list">
            {result.kootas.map((k) => {
              const band = kootaBand(k.got, k.max);
              return (
                <div key={k.key} className={`koota-card band-${band}`}>
                  <div className="kc-top">
                    <span className="kc-name">{k.label} <small className="hi">{k.hindi}</small></span>
                    <span className="kc-score">{k.got}<small>/{k.max}</small></span>
                  </div>
                  <div className="koot-bar"><i style={{ width: `${(k.got / k.max) * 100}%` }} /></div>
                  <p className="kc-note">{kootaSummary(k.key)}</p>
                  <p className="kc-meaning">{kootaMeaning(k.key, k.got, k.max)}</p>
                  {k.note && k.note !== kootaSummary(k.key) && (
                    <details className="kc-more">
                      <summary>Classical reading</summary>
                      <p>{k.note}</p>
                    </details>
                  )}
                </div>
              );
            })}
          </div>

          <div className={`match-dosha ${result.mangal.compatible ? "" : "warn"}`}>
            <div className="md-ic">{result.mangal.compatible ? "✓" : "!"}</div>
            <div className="md-t">
              <b>{result.mangal.compatible ? m.noDoshaConflict : m.doshaMismatch}</b>
              {result.mangal.summary}
            </div>
          </div>

          <p className="insight"><strong>{m.verdict}</strong> {result.recommendation}</p>

          <div className="hero-actions" style={{ justifyContent: "flex-start", marginTop: 24, maxWidth: "none" }}>
            <Link href="/seva" target="_blank" className="btn btn-primary">{m.bookRemedy}</Link>
            <Link href="/astrologers" target="_blank" className="btn btn-outline">{m.consultMarriageAstrologer}</Link>
            <Link href="/match" target="_blank" className="btn btn-outline">{m.newMatch} ({t.common.opensNewTab})</Link>
          </div>

          <p className="kundali-disclaimer">{m.disclaimer}</p>
        </div>
      )}
    </div>
  );
}
