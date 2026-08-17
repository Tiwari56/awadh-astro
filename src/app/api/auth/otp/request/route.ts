import { NextRequest, NextResponse } from "next/server";
import { and, eq, gt, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { otpCodes } from "@/lib/db/schema";
import { sendOtpSms } from "@/lib/sms";
import { sendTransactionalEmail, isEmailConfigured } from "@/lib/email";
import { isSmsConfigured } from "@/lib/sms/config";
import { otpDeliveryConfig } from "@/lib/otp-config";

const PHONE_RE = /^\+?[0-9]{10,15}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_TTL_MINUTES = 10;

/** Max codes per identifier per window — blunt but effective abuse guard. */
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MINUTES = 15;

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6 digits
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { phone?: string; email?: string };
  const rawEmail = body.email?.trim().toLowerCase();
  const rawPhone = body.phone?.trim();

  const channel: "sms" | "email" = rawEmail ? "email" : "sms";
  const identifier = rawEmail || rawPhone || "";

  if (channel === "email" ? !EMAIL_RE.test(identifier) : !PHONE_RE.test(identifier)) {
    return NextResponse.json(
      { error: channel === "email" ? "Enter a valid email address" : "Enter a valid mobile number" },
      { status: 400 }
    );
  }

  // Rate limit: too many recent codes for this identifier.
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60_000);
  const [{ count } = { count: 0 }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(otpCodes)
    .where(and(eq(otpCodes.identifier, identifier), gt(otpCodes.createdAt, since)));
  if (count >= RATE_LIMIT_MAX) {
    return NextResponse.json(
      { error: "Too many codes requested. Please wait a few minutes and try again." },
      { status: 429 }
    );
  }

  const code = generateCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60_000);
  await db.insert(otpCodes).values({ identifier, channel, code, expiresAt });

  let delivered = false;
  if (channel === "email") {
    const res = await sendTransactionalEmail({
      to: identifier,
      subject: `${code} is your Awadh Astro login code`,
      text: [
        "Namaste 🙏",
        "",
        `Your Awadh Astro login code is: ${code}`,
        `It expires in ${OTP_TTL_MINUTES} minutes.`,
        "",
        "If you didn't request this, you can ignore this email.",
        "",
        "— Awadh Astro, Ayodhya",
      ].join("\n"),
    });
    delivered = res.ok && isEmailConfigured();
    if (!res.ok) console.error("[otp] email send failed:", res.error);
  } else {
    const res = await sendOtpSms(identifier, code);
    delivered = res.ok && isSmsConfigured();
  }

  /**
   * Returning the code to the client is a real security tradeoff: anyone who
   * can call this endpoint could sign in as that identifier. It is therefore
   * allowed ONLY when no real delivery provider is configured (so the app is
   * demonstrably not yet serving real users) AND either we're outside
   * production or OTP_ALLOW_TEST_CODE has been explicitly set for the
   * testing phase. Set OTP_ALLOW_TEST_CODE=false the moment real users land.
   */
  const showTestCode = !delivered && otpDeliveryConfig.allowTestCode;

  return NextResponse.json({
    ok: true,
    channel,
    delivered,
    ...(showTestCode ? { devCode: code } : {}),
  });
}
