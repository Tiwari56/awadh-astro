import { NextRequest, NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db/client";
import { bookings } from "@/lib/db/schema";

/** Real DB-backed Seva bookings for signed-in users (booking now requires login — see /seva). */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const rows = await db.select().from(bookings).where(eq(bookings.userId, session.user.id)).orderBy(desc(bookings.createdAt));
  return NextResponse.json({ bookings: rows });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await req.json();
  const { pujaId, pujaName, devoteeName, amountINR, mode } = body as {
    pujaId?: string; pujaName?: string; devoteeName?: string; amountINR?: number; mode?: "online" | "offline";
  };
  if (!pujaId || !pujaName || !devoteeName || !Number.isFinite(amountINR)) {
    return NextResponse.json({ error: "Missing booking details" }, { status: 400 });
  }

  const [row] = await db.insert(bookings).values({
    userId: session.user.id,
    pujaId,
    pujaName,
    devoteeName,
    amountINR: amountINR!,
    mode: mode === "offline" ? "offline" : "online",
  }).returning();

  return NextResponse.json({ booking: row });
}
