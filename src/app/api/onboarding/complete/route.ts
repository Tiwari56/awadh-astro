import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db/client";
import { users, profiles, addresses, wallets, walletTransactions, astrologerProfiles } from "@/lib/db/schema";

interface OnboardingBody {
  role: "user" | "astrologer";
  name: string;
  plan: "free" | "plus";
  address?: { line1: string; city: string; country: string };
  walletTopupINR?: number;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = (await req.json()) as Partial<OnboardingBody>;
  if (!body.role || !body.name?.trim()) {
    return NextResponse.json({ error: "Role and name are required" }, { status: 400 });
  }

  const userId = session.user.id;

  await db.update(users).set({ role: body.role, plan: body.plan ?? "free", name: body.name.trim(), onboarded: true }).where(eq(users.id, userId));
  await db.insert(profiles).values({ userId }).onConflictDoNothing();
  await db.insert(wallets).values({ userId, balanceINR: 0 }).onConflictDoNothing();

  if (body.address?.line1 && body.address.city) {
    await db.insert(addresses).values({
      userId, line1: body.address.line1, city: body.address.city, country: body.address.country || "India",
    });
  }

  // First-topup cashback: 50% of the top-up, capped at ₹100 — matches the
  // benefit shown in the onboarding wallet-step tooltip. Real money movement
  // (Razorpay) isn't wired yet; this credits the dummy wallet ledger.
  const topup = Math.max(0, Math.floor(body.walletTopupINR ?? 0));
  if (topup > 0) {
    const cashback = Math.min(100, Math.round(topup * 0.5));
    const total = topup + cashback;
    await db.update(wallets).set({ balanceINR: total, updatedAt: new Date() }).where(eq(wallets.userId, userId));
    await db.insert(walletTransactions).values([
      { userId, amountINR: topup, type: "credit", reason: "Onboarding top-up" },
      { userId, amountINR: cashback, type: "credit", reason: "First top-up cashback (50%, up to ₹100)" },
    ]);
  }

  if (body.role === "astrologer") {
    await db.insert(astrologerProfiles).values({ userId }).onConflictDoNothing();
  }

  return NextResponse.json({ ok: true });
}
