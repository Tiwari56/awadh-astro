"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { matchKundali, type MatchPerson, type MatchResult } from "@/lib/astrology/matching";

const EMPTY: MatchPerson = { name: "", dateOfBirth: "", timeOfBirth: "", placeOfBirth: "" };

function PersonFields({
  role,
  hindi,
  value,
  onChange,
}: {
  role: string;
  hindi: string;
  value: MatchPerson;
  onChange: (v: MatchPerson) => void;
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
        <input id={`${id}-t`} type="time" required value={value.timeOfBirth} onChange={(e) => set("timeOfBirth", e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor={`${id}-p`}>Place of Birth</label>
        <input id={`${id}-p`} required value={value.placeOfBirth} placeholder="e.g. Lucknow" onChange={(e) => set("placeOfBirth", e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor={`${id}-f`}>Have an existing Kundali? <span className="opt">(optional, image or PDF)</span></label>
        {!fileName ? (
          <label className="upload-drop" htmlFor={`${id}-f`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" /></svg>
            <span>Upload to share with your astrologer</span>
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
        <p className="opt" style={{ marginTop: 4 }}>
          We can&apos;t auto-read birth details from an uploaded chart yet — please still fill the fields
          above so we can compute the match instantly. An astrologer will cross-check the upload.
        </p>
      </div>
    </div>
  );
}

export default function MatchPage() {
  const [bride, setBride] = useState<MatchPerson>(EMPTY);
  const [groom, setGroom] = useState<MatchPerson>(EMPTY);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      setResult(await matchKundali(bride, groom));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container section">
      <h2>Kundali Matching</h2>
      <p style={{ color: "var(--ink-soft)", marginBottom: 22 }}>
        Ashtakoot Guna Milan — the 36-point Vedic compatibility system used for marriage.{" "}
        <span className="hi">गुण मिलान</span>
      </p>

      {!result && (
        <details className="guide-card">
          <summary>Why does Kundali Matching matter? <span className="opt">— tap to read the guide</span></summary>
          <div className="guide-body">
            <p>
              Ashtakoot Guna Milan compares the bride&apos;s and groom&apos;s Moon-sign placements across
              8 factors (&ldquo;kootas&rdquo;), each worth a fixed number of points, for 36 total. It is one
              of the oldest and most widely used Vedic tools for judging marital compatibility.
            </p>
            <ul>
              <li><b>Varna &amp; Vashya</b> — spiritual temperament and mutual influence.</li>
              <li><b>Tara</b> — health and general fortune as a couple.</li>
              <li><b>Yoni</b> — physical and intimate compatibility.</li>
              <li><b>Graha Maitri</b> — mental and intellectual bonding.</li>
              <li><b>Gana</b> — temperament match (calm, active or fierce natures).</li>
              <li><b>Bhakoot</b> — love, finances and family welfare.</li>
              <li><b>Nadi</b> — genetic health of future children; the single most heavily weighted koota.</li>
            </ul>
            <p>
              <b>How to read your score:</b> 18+/36 is generally considered acceptable, 25+ very good, and
              32+ excellent. A low score on any single koota — especially Nadi — is traditionally taken more
              seriously than the overall percentage, and is usually where astrologers suggest a remedy
              (puja) rather than treating the match as incompatible outright.
            </p>
            <p className="opt">
              This is one input among many for a marriage decision, not a verdict — always pair a report
              like this with a conversation with a real astrologer for context.
            </p>
          </div>
        </details>
      )}

      {!result && (
        <form onSubmit={onSubmit}>
          <div className="grid grid-2" style={{ marginBottom: 18 }}>
            <PersonFields role="Bride" hindi="वधू" value={bride} onChange={setBride} />
            <PersonFields role="Groom" hindi="वर" value={groom} onChange={setGroom} />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ minWidth: 220 }}>
            {loading ? "Matching…" : "Match Kundalis"}
          </button>
        </form>
      )}

      {result && (
        <div>
          <div className="match-pair">
            <div className="mp">
              <div className="mp-av">{(bride.name || "V")[0].toUpperCase()}</div>
              <div className="mp-role">Bride · <span className="hi">वधू</span></div>
              <div className="mp-name">{bride.name || "Bride"}</div>
              <div className="mp-dt">{bride.dateOfBirth} · {bride.placeOfBirth}</div>
            </div>
            <div className="match-vs">✦</div>
            <div className="mp">
              <div className="mp-av">{(groom.name || "V")[0].toUpperCase()}</div>
              <div className="mp-role">Groom · <span className="hi">वर</span></div>
              <div className="mp-name">{groom.name || "Groom"}</div>
              <div className="mp-dt">{groom.dateOfBirth} · {groom.placeOfBirth}</div>
            </div>
          </div>

          <div className="gauge" style={{ ["--pct" as string]: result.percent }}>
            <div className="gauge-in">
              <div className="gauge-pct">{result.percent}<small>%</small></div>
              <div className="gauge-of">{result.totalGot} / {result.totalMax} Guna</div>
              <div className="gauge-verdict">✦ {result.verdict.toUpperCase()}</div>
            </div>
          </div>

          <div className="divider"><span className="di" /></div>
          <h3 className="kundali-section-title">Ashtakoot breakdown</h3>
          <div className="card" style={{ padding: "6px 20px" }}>
            {result.kootas.map((k) => (
              <div key={k.key} className="koot-row">
                <div className="koot-name">{k.label}<small className="hi">{k.hindi}</small></div>
                <div className="koot-bar"><i style={{ width: `${(k.got / k.max) * 100}%` }} /></div>
                <div className="koot-pct">{k.got}/{k.max}</div>
              </div>
            ))}
          </div>

          <div className={`match-dosha ${result.mangal.compatible ? "" : "warn"}`}>
            <div className="md-ic">{result.mangal.compatible ? "✓" : "!"}</div>
            <div className="md-t">
              <b>{result.mangal.compatible ? "No Mangal Dosha conflict" : "Mangal Dosha mismatch"}</b>
              {result.mangal.summary}
            </div>
          </div>

          <p className="insight"><strong>Verdict.</strong> {result.recommendation}</p>

          <div className="hero-actions" style={{ justifyContent: "flex-start", marginTop: 24, maxWidth: "none" }}>
            <Link href="/seva" className="btn btn-primary">Book a Remedial Puja</Link>
            <Link href="/astrologers" className="btn btn-outline">Consult a Marriage Astrologer</Link>
            <button className="btn btn-outline" onClick={() => setResult(null)}>New Match</button>
          </div>

          <p className="kundali-disclaimer">
            For informational and spiritual purposes only. Compatibility is one of many factors in a marriage.
          </p>
        </div>
      )}
    </div>
  );
}
