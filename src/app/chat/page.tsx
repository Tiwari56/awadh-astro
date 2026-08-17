"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { ChatMessage, ChatUpsellPayload } from "@/types";

const HOROSCOPE_TIMES = ["6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "8:00 PM", "9:00 PM"];

/**
 * The consulting-intent upsell card — shows Plus benefits + lets the user
 * sign up to get their daily horoscope by EMAIL (the founder's call: build
 * WhatsApp delivery later — a WhatsApp Business API account is a separate
 * business decision — but wire up email now, since a working email signup
 * is buildable today). Real delivery still needs an email provider key (see
 * src/lib/email/providers/resend.ts); until then this calls the dummy
 * provider, which logs instead of sending — the confirmation UI is real,
 * the delivery isn't yet.
 */
function UpsellCard({ upsell }: { upsell: ChatUpsellPayload }) {
  const [time, setTime] = useState(HOROSCOPE_TIMES[1]);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function subscribe(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/email/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, preferredTime: time }),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="msg msg-ai msg-upsell">
      <div className="upsell-card">
        <div className="upsell-headline">✨ {upsell.headline}</div>
        <ul className="upsell-benefits">
          {upsell.benefits.map((b) => <li key={b}>{b}</li>)}
        </ul>
        <Link href={upsell.ctaHref} className="btn btn-primary btn-sm" style={{ width: "100%", justifyContent: "center" }}>
          {upsell.ctaLabel}
        </Link>
        <form className="upsell-schedule" onSubmit={subscribe}>
          <span>📧 Get your daily horoscope by email at</span>
          <div className="upsell-schedule-row">
            <select value={time} onChange={(e) => setTime(e.target.value)}>
              {HOROSCOPE_TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          {status === "sent" ? (
            <span className="city-note ok">✓ You&apos;re signed up — check your inbox to confirm.</span>
          ) : (
            <>
              <div className="upsell-schedule-row">
                <input type="email" required placeholder="you@example.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} style={{ flex: 1 }} />
                <button type="submit" className="btn btn-outline btn-sm" disabled={status === "sending"}>
                  {status === "sending" ? "…" : "Sign up"}
                </button>
              </div>
              {status === "error" && <span className="city-note warn">Could not sign up right now — please try again.</span>}
            </>
          )}
        </form>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const { t, locale } = useLanguage();
  const c = t.chat;
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "welcome", role: "ai", text: c.welcome, timestamp: Date.now() },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function onSend(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", text, timestamp: Date.now() };
    const history = messages.map((m) => ({ role: m.role, text: m.text }));
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history, locale }),
      });
      const data = (await res.json()) as { text?: string; kind?: "text" | "upsell"; upsell?: ChatUpsellPayload; error?: string };
      const aiMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "ai",
        text: data.text ?? data.error ?? "Sorry, I could not respond. Please try again.",
        timestamp: Date.now(),
        kind: data.kind ?? "text",
        upsell: data.upsell,
      };
      setMessages((m) => [...m, aiMsg]);
    } catch {
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), role: "ai", text: "Network error — please try again.", timestamp: Date.now() },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="container section" style={{ maxWidth: 720 }}>
      <h2>{t.nav.aiChat}</h2>
      <div className="chat-box">
        <div className="chat-messages">
          {messages.map((m) =>
            m.kind === "upsell" && m.upsell ? (
              <div key={m.id}>
                <div className="msg msg-ai">{m.text}</div>
                <UpsellCard upsell={m.upsell} />
              </div>
            ) : (
              <div key={m.id} className={`msg ${m.role === "user" ? "msg-user" : "msg-ai"}`}>
                {m.text}
              </div>
            )
          )}
          {sending && <div className="msg msg-ai">{c.consulting}</div>}
          <div ref={bottomRef} />
        </div>
        <form className="chat-input-row" onSubmit={onSend}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={c.placeholder}
            aria-label="Chat message"
          />
          <button className="btn btn-primary" style={{ padding: "0 24px", minHeight: "auto" }} type="submit" disabled={sending || !input.trim()}>
            {c.send}
          </button>
        </form>
        <p className="ai-disclaimer">{c.disclaimer}</p>
      </div>
    </div>
  );
}
