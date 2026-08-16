import { NextRequest, NextResponse } from "next/server";
import { computeKundali } from "@/lib/astrology";
import type { BirthDetails } from "@/types";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Partial<BirthDetails> & { locale?: string };
  const { locale, ...details } = body;

  const timeOk = details.timeUnknown || Boolean(details.timeOfBirth);
  if (!details.name || !details.dateOfBirth || !timeOk || !details.placeOfBirth) {
    return NextResponse.json({ error: "Missing required birth details" }, { status: 400 });
  }

  const result = await computeKundali(details as BirthDetails, locale);
  return NextResponse.json(result);
}
