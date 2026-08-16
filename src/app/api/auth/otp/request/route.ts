import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { otpCodes } from "@/lib/db/schema";
import { sendOtpSms } from "@/lib/sms";

const PHONE_RE = /^\+?[0-9]{10,15}$/;
const OTP_TTL_MINUTES = 10;

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6 digits
}

export async function POST(req: NextRequest) {
  const { phone } = (await req.json()) as { phone?: string };
  if (!phone || !PHONE_RE.test(phone)) {
    return NextResponse.json({ error: "Enter a valid mobile number" }, { status: 400 });
  }

  const code = generateCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60_000);
  await db.insert(otpCodes).values({ phone, code, expiresAt });

  const result = await sendOtpSms(phone, code);
  // devCode is only ever populated outside production (see sms/providers/dummy.ts) —
  // surfacing it here is what lets the login flow be tested end-to-end without a
  // real SMS bill. It is never present when a real provider is configured.
  return NextResponse.json({ ok: true, devCode: result.devCode });
}
