import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db/client";
import { wallets } from "@/lib/db/schema";

/** Real DB-backed wallet for signed-in users — distinct from the guest/localStorage dummy wallet used on Seva for unauthenticated browsing. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const [wallet] = await db.select().from(wallets).where(eq(wallets.userId, session.user.id)).limit(1);
  return NextResponse.json({ balanceINR: wallet?.balanceINR ?? 0 });
}
