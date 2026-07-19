"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import type { ChatMessage } from "@/types";

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "ai",
  text: "Namaste 🙏 I am your Awadh Astro AI guide. Ask me anything about your kundali, an upcoming decision, or today's panchang.",
  timestamp: Date.now(),
};

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
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
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      const aiMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "ai",
        text: data.reply ?? data.error ?? "Sorry, I could not respond. Please try again.",
        timestamp: Date.now(),
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
      <h2>AI Astro Chat</h2>
      <div className="chat-box">
        <div className="chat-messages">
          {messages.map((m) => (
            <div key={m.id} className={`msg ${m.role === "user" ? "msg-user" : "msg-ai"}`}>
              {m.text}
            </div>
          ))}
          {sending && <div className="msg msg-ai">Consulting the stars…</div>}
          <div ref={bottomRef} />
        </div>
        <form className="chat-input-row" onSubmit={onSend}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your kundali, career, marriage…"
            aria-label="Chat message"
          />
          <button className="btn btn-primary" style={{ padding: "0 24px", minHeight: "auto" }} type="submit" disabled={sending || !input.trim()}>
            Send
          </button>
        </form>
        <p className="ai-disclaimer">
          You are chatting with an AI. Guidance is spiritual/informational only.
        </p>
      </div>
    </div>
  );
}
