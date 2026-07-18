import { NextRequest, NextResponse } from "next/server";
import { computeKundali } from "@/lib/astrology";
import type { BirthDetails } from "@/types";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Partial<BirthDetails>;

  if (!body.name || !body.dateOfBirth || !body.timeOfBirth || !body.placeOfBirth) {
    return NextResponse.json({ error: "Missing required birth details" }, { status: 400 });
  }

  const result = await computeKundali(body as BirthDetails);
  return NextResponse.json(result);
}
