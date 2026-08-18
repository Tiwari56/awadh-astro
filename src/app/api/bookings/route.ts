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
  const {
    pujaId, pujaName, devoteeName, amountINR,
    attendance, bookingFor, beneficiaryName, wantsLiveStream, wantsRecording, paymentMethod,
  } = body as {
    pujaId?: string; pujaName?: string; devoteeName?: string; amountINR?: number;
    attendance?: "online" | "in_person"; bookingFor?: "self" | "family";
    beneficiaryName?: string; wantsLiveStream?: boolean; wantsRecording?: boolean;
    paymentMethod?: "wallet" | "cash";
  };
  if (!pujaId || !pujaName || !devoteeName || !Number.isFinite(amountINR)) {
    return NextResponse.json({ error: "Missing booking details" }, { status: 400 });
  }

  const att = attendance === "in_person" ? "in_person" : "online";
  // A live stream only exists for an online sitting — silently dropping the
  // flag here (rather than trusting the client) keeps the row self-consistent.
  const liveStream = att === "online" && Boolean(wantsLiveStream);

  const [row] = await db.insert(bookings).values({
    userId: session.user.id,
    pujaId,
    pujaName,
    devoteeName,
    amountINR: amountINR!,
    mode: paymentMethod === "cash" ? "offline" : "online", // legacy column
    attendance: att,
    bookingFor: bookingFor === "family" ? "family" : "self",
    beneficiaryName: bookingFor === "family" ? (beneficiaryName?.trim() || null) : null,
    wantsLiveStream: liveStream,
    wantsRecording: Boolean(wantsRecording),
    paymentMethod: paymentMethod === "cash" ? "cash" : "wallet",
  }).returning();

  return NextResponse.json({ booking: row });
}
