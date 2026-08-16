import { NextRequest, NextResponse } from "next/server";
import { matchKundali, type MatchPerson } from "@/lib/astrology/matching";

/**
 * matchKundali() calls Prokerala with PROKERALA_CLIENT_SECRET, which must
 * never reach the browser — so this runs server-side even though the mock
 * fallback itself would have been safe to call client-side. Mirrors
 * /api/kundali for the same reason.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json()) as { bride?: Partial<MatchPerson>; groom?: Partial<MatchPerson> };

  const required = (p?: Partial<MatchPerson>) =>
    Boolean(p?.name && p.dateOfBirth && p.timeOfBirth && p.placeOfBirth);

  if (!required(body.bride) || !required(body.groom)) {
    return NextResponse.json({ error: "Missing required birth details for bride and/or groom" }, { status: 400 });
  }

  const result = await matchKundali(body.bride as MatchPerson, body.groom as MatchPerson);
  return NextResponse.json(result);
}
