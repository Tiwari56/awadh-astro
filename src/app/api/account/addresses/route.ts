import { NextRequest, NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db/client";
import { addresses } from "@/lib/db/schema";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const rows = await db.select().from(addresses).where(eq(addresses.userId, session.user.id)).orderBy(desc(addresses.createdAt));
  return NextResponse.json({ addresses: rows });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await req.json();
  const { label, line1, city, state, pincode } = body as {
    label?: string; line1?: string; city?: string; state?: string; pincode?: string;
  };
  if (!line1 || !city) {
    return NextResponse.json({ error: "line1 and city are required" }, { status: 400 });
  }

  const [row] = await db.insert(addresses).values({
    userId: session.user.id,
    label: label || "Home",
    line1,
    city,
    state: state || null,
    pincode: pincode || null,
  }).returning();

  return NextResponse.json({ address: row });
}
