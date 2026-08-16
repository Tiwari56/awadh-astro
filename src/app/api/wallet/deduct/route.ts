import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db/client";
import { wallets, walletTransactions } from "@/lib/db/schema";

/** Debits the signed-in user's real wallet (e.g. paying for a Seva booking online). */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const userId = session.user.id;

  const body = await req.json();
  const amount = Number(body?.amountINR);
  const reason = typeof body?.reason === "string" && body.reason.trim() ? body.reason.trim() : "Payment";
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const [wallet] = await db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);
  const balance = wallet?.balanceINR ?? 0;
  if (balance < amount) {
    return NextResponse.json({ error: "Insufficient balance", balanceINR: balance }, { status: 400 });
  }

  await db.update(wallets).set({ balanceINR: sql`${wallets.balanceINR} - ${amount}`, updatedAt: new Date() }).where(eq(wallets.userId, userId));
  await db.insert(walletTransactions).values({ userId, amountINR: amount, type: "debit", reason });

  const [updated] = await db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);
  return NextResponse.json({ balanceINR: updated?.balanceINR ?? 0 });
}
