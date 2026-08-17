import { NextRequest, NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { generateChatReply } from "@/lib/ai";
import type { ChatTurn } from "@/lib/ai";
import { auth } from "@/auth";
import { db } from "@/lib/db/client";
import { kundaliRecords } from "@/lib/db/schema";
import type { KundaliResult } from "@/types";

/**
 * AI astro chat endpoint. Dispatches to src/lib/ai (see that folder for the
 * provider-swap layout). Never computes chart data itself — it loads the
 * caller's most recent saved kundali and passes it as grounding, so replies
 * reference real computed positions rather than invented ones.
 */
export async function POST(req: NextRequest) {
  const { message, history, locale } = (await req.json()) as { message?: string; history?: ChatTurn[]; locale?: string };

  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  // Ground the reply in the signed-in user's own chart when we have one.
  let kundali: KundaliResult | undefined;
  const session = await auth();
  if (session?.user?.id) {
    const [row] = await db
      .select({ resultJson: kundaliRecords.resultJson })
      .from(kundaliRecords)
      .where(eq(kundaliRecords.userId, session.user.id))
      .orderBy(desc(kundaliRecords.createdAt))
      .limit(1);
    if (row?.resultJson) kundali = row.resultJson as KundaliResult;
  }

  const reply = await generateChatReply({
    message,
    history: Array.isArray(history) ? history : [],
    kundali,
    locale,
  });
  return NextResponse.json(reply);
}
