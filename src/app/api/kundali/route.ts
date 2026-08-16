import { NextRequest, NextResponse } from "next/server";
import { computeKundali } from "@/lib/astrology";
import { auth } from "@/auth";
import { db } from "@/lib/db/client";
import { kundaliRecords } from "@/lib/db/schema";
import type { BirthDetails } from "@/types";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Partial<BirthDetails> & { locale?: string };
  const { locale, ...details } = body;

  const timeOk = details.timeUnknown || Boolean(details.timeOfBirth);
  if (!details.name || !details.dateOfBirth || !timeOk || !details.placeOfBirth) {
    return NextResponse.json({ error: "Missing required birth details" }, { status: 400 });
  }

  const result = await computeKundali(details as BirthDetails, locale);

  // Persist to the signed-in user's account so it shows up under My Kundalis.
  // Guests still get their kundali computed (no login wall) — it's just not saved.
  const session = await auth();
  if (session?.user?.id) {
    await db.insert(kundaliRecords).values({
      userId: session.user.id,
      subjectName: details.name!,
      dateOfBirth: details.dateOfBirth!,
      timeOfBirth: details.timeOfBirth || "12:00",
      timeUnknown: Boolean(details.timeUnknown),
      placeOfBirth: details.placeOfBirth!,
      resultJson: result,
    });
  }

  return NextResponse.json(result);
}
