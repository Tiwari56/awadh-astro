import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db/client";
import { astrologerProfiles } from "@/lib/db/schema";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (session.user.role !== "astrologer") return NextResponse.json({ error: "Astrologer role required" }, { status: 403 });

  const [profile] = await db.select().from(astrologerProfiles).where(eq(astrologerProfiles.userId, session.user.id)).limit(1);
  return NextResponse.json({ profile: profile ?? null });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (session.user.role !== "astrologer") return NextResponse.json({ error: "Astrologer role required" }, { status: 403 });

  const body = await req.json();
  const { specialties, languages, experienceYears, ratePerMinINR, bio } = body as {
    specialties?: string[]; languages?: string[]; experienceYears?: number; ratePerMinINR?: number; bio?: string;
  };

  await db.insert(astrologerProfiles).values({ userId: session.user.id }).onConflictDoNothing();
  const [updated] = await db.update(astrologerProfiles).set({
    ...(specialties ? { specialties } : {}),
    ...(languages ? { languages } : {}),
    ...(experienceYears !== undefined ? { experienceYears } : {}),
    ...(ratePerMinINR !== undefined ? { ratePerMinINR } : {}),
    ...(bio !== undefined ? { bio } : {}),
  }).where(eq(astrologerProfiles.userId, session.user.id)).returning();

  return NextResponse.json({ profile: updated });
}
