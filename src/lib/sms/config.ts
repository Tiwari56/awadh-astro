/**
 * SMS/OTP provider configuration — mirrors astrology/, ai/, and email/'s
 * pattern. Mobile number is the PRIMARY signup identifier per the founder's
 * brief, but sending a real SMS needs a provider account (MSG91, Twilio,
 * Gupshup — MSG91 is the common choice for India-focused apps: DLT-registered
 * templates, competitive INR pricing) which is a business/billing decision,
 * not something to fake. Until one is chosen, OTPs are generated and stored
 * for real, but "sent" by the dummy provider, which surfaces the code back
 * to the client ONLY outside production so the login flow is fully testable
 * without a real SMS bill.
 */

export type SmsProviderName = "dummy" | "msg91";

export const smsConfig = {
  provider: (process.env.SMS_PROVIDER as SmsProviderName) || "dummy",
  msg91: {
    authKey: process.env.MSG91_AUTH_KEY,
    templateId: process.env.MSG91_TEMPLATE_ID,
  },
} as const;

export function isMsg91Configured(): boolean {
  return smsConfig.provider === "msg91" && Boolean(smsConfig.msg91.authKey);
}
