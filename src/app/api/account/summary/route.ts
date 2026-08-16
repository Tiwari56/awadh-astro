import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db/client";
import { users, addresses, wallets, kundaliRecords, astrologerProfiles, bookings } from "@/lib/db/schema";

/** One-shot summary for the /account page — user, wallet, addresses, saved kundalis, and (if applicable) astrologer profile. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const userId = session.user.id;

  const [[user], userAddresses, [wallet], kundalis, [astrologerProfile], userBookings] = await Promise.all([
    db.select().from(users).where(eq(users.id, userId)).limit(1),
    db.select().from(addresses).where(eq(addresses.userId, userId)).orderBy(desc(addresses.createdAt)),
    db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1),
    db.select().from(kundaliRecords).where(eq(kundaliRecords.userId, userId)).orderBy(desc(kundaliRecords.createdAt)).limit(10),
    db.select().from(astrologerProfiles).where(eq(astrologerProfiles.userId, userId)).limit(1),
    db.select().from(bookings).where(eq(bookings.userId, userId)).orderBy(desc(bookings.createdAt)).limit(10),
  ]);

  return NextResponse.json({
    user: user ? { name: user.name, phone: user.phone, email: user.email, role: user.role, plan: user.plan } : null,
    addresses: userAddresses,
    walletBalanceINR: wallet?.balanceINR ?? 0,
    kundalis: kundalis.map((k) => ({
      id: k.id, subjectName: k.subjectName, dateOfBirth: k.dateOfBirth, placeOfBirth: k.placeOfBirth, createdAt: k.createdAt,
    })),
    astrologerProfile: astrologerProfile ?? null,
    bookings: userBookings.map((b) => ({
      id: b.id, pujaName: b.pujaName, devoteeName: b.devoteeName, amountINR: b.amountINR,
      mode: b.mode, status: b.status, createdAt: b.createdAt,
    })),
  });
}
