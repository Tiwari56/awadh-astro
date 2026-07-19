"use client";

import { useEffect, useMemo, useState } from "react";
import AstrologerCard from "@/components/ui/AstrologerCard";
import { getAstrologers } from "@/lib/data/astrologers";
import type { Astrologer, AstrologerStatus } from "@/types";

type Filter = "all" | AstrologerStatus;

export default function AstrologersPage() {
  const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    getAstrologers().then(setAstrologers);
  }, []);

  const online = astrologers.filter((a) => a.status === "online").length;

  const visible = useMemo(
    () => (filter === "all" ? astrologers : astrologers.filter((a) => a.status === filter)),
    [astrologers, filter]
  );

  return (
    <div className="container section">
      <h2>Talk to an Astrologer</h2>
      <p style={{ marginBottom: 20, color: "var(--ink-soft)" }}>
        <strong style={{ color: "var(--green)" }}>{online} astrologers online now</strong> — first
        minute free for new users.
      </p>

      <div className="filter-bar">
        {(["all", "online", "busy", "offline"] as Filter[]).map((f) => (
          <button key={f} className={`chip ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
            {f === "all" ? "All" : f[0].toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-3">
        {visible.map((a) => (
          <AstrologerCard key={a.id} astrologer={a} />
        ))}
      </div>
    </div>
  );
}
