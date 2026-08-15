"use client";

import { useEffect, useMemo, useState } from "react";
import AstrologerCard from "@/components/ui/AstrologerCard";
import { getAstrologers } from "@/lib/data/astrologers";
import type { Astrologer, AstrologerStatus, ConsultMode } from "@/types";

type StatusFilter = "all" | AstrologerStatus;
type ModeFilter = "all" | ConsultMode;

export default function AstrologersPage() {
  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [modeFilter, setModeFilter] = useState<ModeFilter>("all");
  const [marriageOnly, setMarriageOnly] = useState(false);

  useEffect(() => {
    getAstrologers().then(setAstrologers);
  }, []);

  const online = astrologers.filter((a) => a.status === "online").length;

  const visible = useMemo(() => {
    return astrologers.filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (modeFilter !== "all" && !a.consultModes.includes(modeFilter)) return false;
      if (marriageOnly && !a.specialties.some((s) => /marriage|kundali milan/i.test(s))) return false;
      return true;
    });
  }, [astrologers, statusFilter, modeFilter, marriageOnly]);

  return (
    <div className="container section">
      <h2>Talk to an Astrologer</h2>
      <p style={{ marginBottom: 20, color: "var(--ink-soft)" }}>
        <strong style={{ color: "var(--green)" }}>{online} astrologers online now</strong> — first
        minute free for new users.
      </p>

      <div className="filter-bar">
        {(["all", "online", "busy", "offline"] as StatusFilter[]).map((f) => (
          <button key={f} className={`chip ${statusFilter === f ? "active" : ""}`} onClick={() => setStatusFilter(f)}>
            {f === "all" ? "All" : f[0].toUpperCase() + f.slice(1)}
          </button>
        ))}
        <span style={{ width: 1, background: "var(--line)", flexShrink: 0 }} />
        {(["all", "online", "in-person"] as ModeFilter[]).map((f) => (
          <button key={f} className={`chip ${modeFilter === f ? "active" : ""}`} onClick={() => setModeFilter(f)}>
            {f === "all" ? "Any Mode" : f === "online" ? "💻 Online" : "🛕 In-Person (Ayodhya)"}
          </button>
        ))}
        <span style={{ width: 1, background: "var(--line)", flexShrink: 0 }} />
        <button className={`chip ${marriageOnly ? "active" : ""}`} onClick={() => setMarriageOnly((m) => !m)}>
          💑 Marriage Astrologers
        </button>
      </div>

      {marriageOnly && (
        <p style={{ marginBottom: 16, fontSize: "0.85rem", color: "var(--ink-soft)" }}>
          Specialists in Kundali Milan and marriage compatibility — for the full 36-point Guna Milan
          score, try <a href="/match" style={{ color: "var(--gold-bright)", fontWeight: 600 }}>Kundali Matching</a> first.
        </p>
      )}

      <div className="grid grid-3">
        {visible.map((a) => (
          <AstrologerCard key={a.id} astrologer={a} />
        ))}
      </div>
      {visible.length === 0 && (
        <p style={{ color: "var(--ink-soft)", textAlign: "center", padding: "40px 0" }}>
          No astrologers match these filters right now — try widening your search.
        </p>
      )}
    </div>
  );
}
