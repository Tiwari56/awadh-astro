import type { SmsProvider, SmsSendResult } from "../provider";
import { smsConfig } from "../config";

/**
 * Brevo transactional SMS. Same account/key as the email provider, so one
 * signup covers both channels.
 *
 * NOTE: SMS is NOT part of Brevo's free tier — it is pay-as-you-go credits,
 * and India additionally requires DLT sender/template registration like every
 * other Indian SMS route. Email OTP (see lib/email/providers/brevo.ts) is the
 * genuinely free path; this exists for when SMS is funded.
 *
 * Docs: POST https://api.brevo.com/v3/transactionalSMS/sms
 */
export const brevoSmsProvider: SmsProvider = {
  name: "brevo",
  async sendOtp(phone: string, code: string): Promise<SmsSendResult> {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) throw new Error("BREVO_API_KEY is not set");

    const res = await fetch("https://api.brevo.com/v3/transactionalSMS/sms", {
      method: "POST",
      headers: { "api-key": apiKey, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        type: "transactional",
        sender: smsConfig.senderId,
        recipient: phone.replace(/^\+/, ""), // Brevo expects digits with country code, no '+'
        content: `${code} is your Awadh Astro login code. Valid for 10 minutes.`,
      }),
    });
    if (!res.ok) {
      throw new Error(`Brevo SMS ${res.status}: ${(await res.text()).slice(0, 300)}`);
    }
    return { ok: true };
  },
};
