import type { SmsProvider, SmsSendResult } from "../provider";

/**
 * Dummy provider — logs instead of sending a real SMS. In non-production, it
 * also returns the code to the caller so the OTP screen can show a
 * "dev mode: your code is 123456" hint — never do this once a real
 * provider is wired (guarded by NODE_ENV, not a feature flag, so it can't
 * accidentally ship on).
 */
export const dummySmsProvider: SmsProvider = {
  name: "dummy",
  async sendOtp(phone: string, code: string): Promise<SmsSendResult> {
    console.log(`[sms:dummy] Would send OTP ${code} to ${phone}`);
    return { ok: true, devCode: process.env.NODE_ENV === "production" ? undefined : code };
  },
};
