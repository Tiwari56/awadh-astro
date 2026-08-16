"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import type { Astrologer } from "@/types";

const statusLabel: Record<Astrologer["status"], string> = {
  online: "Online",
  busy: "Busy",
  offline: "Offline",
};

export default function AstrologerCard({ astrologer }: { astrologer: Astrologer }) {
  const a = astrologer;
  const router = useRouter();
  const { status } = useSession();

  function onChatNow() {
    if (status !== "authenticated") {
      router.push("/login?callbackUrl=/astrologers");
      return;
    }
    // Real per-astrologer live chat/call is a later sprint — route to the
    // working free AI chat for now rather than dead-ending the click.
    router.push("/chat");
  }

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

      <div className="astro-tags">
        {a.consultModes.includes("online") && <span className="tag tag-mode">💻 Online</span>}
        {a.consultModes.includes("in-person") && <span className="tag tag-mode">🛕 In-Person</span>}
      </div>
      {a.officeLocation && a.consultModes.includes("in-person") && (
        <div className="astro-meta">📍 {a.officeLocation}</div>
      )}

      <div className="astro-meta">
        {a.experienceYears} yrs experience · {a.languages.join(", ")}
      </div>

      <div className="astro-bottom">
        <span className="rate">
          ₹{a.ratePerMin}<small>/min</small>
        </span>
        <button className="btn btn-primary btn-sm" disabled={a.status !== "online"} onClick={onChatNow}>
          {a.status === "online" ? "Chat Now" : statusLabel[a.status]}
        </button>
      </div>
    </div>
  );
}
