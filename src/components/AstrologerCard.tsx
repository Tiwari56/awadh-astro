import type { Astrologer } from "@/types";

const statusLabel: Record<Astrologer["status"], string> = {
  online: "Online",
  busy: "Busy",
  offline: "Offline",
};

export default function AstrologerCard({ astrologer }: { astrologer: Astrologer }) {
  const a = astrologer;
  return (
    <div className="card astro-card">
      <div className="astro-top">
        <div className="avatar">{a.photoInitials}</div>
        <div>
          <div className="astro-name">{a.name}</div>
          {a.ayodhyaVerified && <div className="verified">✔ Ayodhya Verified</div>}
          <div className="astro-meta">
            <span className={`status-dot status-${a.status}`} />
            {statusLabel[a.status]} · ⭐ {a.rating} · {a.totalConsults.toLocaleString("en-IN")} consults
          </div>
        </div>
      </div>

      <div className="astro-tags">
        {a.specialties.map((s) => (
          <span key={s} className="tag">{s}</span>
        ))}
      </div>

      <div className="astro-meta">
        {a.experienceYears} yrs experience · {a.languages.join(", ")}
      </div>

      <div className="astro-bottom">
        <span className="rate">
          ₹{a.ratePerMin}<small>/min</small>
        </span>
        <button className="btn btn-primary btn-sm" disabled={a.status !== "online"}>
          {a.status === "online" ? "Chat Now" : statusLabel[a.status]}
        </button>
      </div>
    </div>
  );
}
