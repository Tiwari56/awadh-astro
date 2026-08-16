import { NextRequest, NextResponse } from "next/server";
import { eq, and, sql } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db/client";
import { wallets, walletTransactions } from "@/lib/db/schema";

// Must match the reason string used by the onboarding wallet step, so a
// cashback granted there also counts as "already used" here.
const FIRST_TOPUP_CASHBACK_REASON = "First top-up cashback (50%, up to ₹100)";

/** Dummy top-up (no real payment gateway yet) — credits the wallet instantly. Cashback applies only on the user's literal first-ever top-up. */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const userId = session.user.id;

  const body = await req.json();
  const amount = Number(body?.amountINR);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const priorCashback = await db
    .select({ id: walletTransactions.id })
    .from(walletTransactions)
    .where(and(eq(walletTransactions.userId, userId), eq(walletTransactions.reason, FIRST_TOPUP_CASHBACK_REASON)))
    .limit(1);
  const isFirstTopup = priorCashback.length === 0;
  const cashback = isFirstTopup ? Math.min(100, Math.round(amount * 0.5)) : 0;
  const totalCredit = amount + cashback;

  await db.insert(wallets).values({ userId, balanceINR: totalCredit }).onConflictDoUpdate({
    target: wallets.userId,
    set: { balanceINR: sql`${wallets.balanceINR} + ${totalCredit}`, updatedAt: new Date() },
  });

  await db.insert(walletTransactions).values({ userId, amountINR: amount, type: "credit", reason: "Wallet top-up" });
  if (cashback > 0) {
    await db.insert(walletTransactions).values({ userId, amountINR: cashback, type: "credit", reason: FIRST_TOPUP_CASHBACK_REASON });
  }

  const [wallet] = await db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);
  return NextResponse.json({ balanceINR: wallet?.balanceINR ?? 0, cashbackApplied: cashback });
}
