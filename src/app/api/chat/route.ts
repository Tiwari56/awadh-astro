import { NextRequest, NextResponse } from "next/server";
import { generateChatReply } from "@/lib/ai";
import type { ChatTurn } from "@/lib/ai";

/**
 * AI astro chat endpoint. Dispatches to src/lib/ai (dummy provider today;
 * see src/lib/ai/providers/rag.ts for the documented upgrade path). Never
 * computes chart data itself — that's the astrology seam's job.
 */
export async function POST(req: NextRequest) {
  const { message, history } = (await req.json()) as { message?: string; history?: ChatTurn[] };

  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const reply = await generateChatReply({ message, history: Array.isArray(history) ? history : [] });
  return NextResponse.json(reply);
}
