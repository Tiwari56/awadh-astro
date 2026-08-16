import { NextRequest, NextResponse } from "next/server";
import { sendDailyHoroscopeSignupConfirmation } from "@/lib/email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { email?: string; preferredTime?: string; name?: string };

  if (!body.email || !EMAIL_RE.test(body.email) || !body.preferredTime) {
    return NextResponse.json({ error: "A valid email and preferred time are required" }, { status: 400 });
  }

  const result = await sendDailyHoroscopeSignupConfirmation({
    email: body.email,
    preferredTime: body.preferredTime,
    name: body.name,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? "Could not send confirmation" }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
