/**
 * Email provider configuration (env-driven) — mirrors astrology/config.ts
 * and ai/config.ts's pattern.
 *
 * Founder's brief: WhatsApp delivery for Plus daily-horoscope needs a
 * WhatsApp Business API account (Gupshup/Twilio/Meta direct) which is a
 * business-side decision, not something to fake — "for now just send to
 * email if possible." Email still needs a provider + API key (Resend/
 * SendGrid/Postmark/SES all require one; there's no keyless transactional
 * email service), so this is scaffolded the same way as the RAG chat
 * provider: a working dummy today, a documented real implementation to
 * wire in once a provider is chosen.
 */

export type EmailProviderName = "dummy" | "resend";

export const emailConfig = {
  provider: (process.env.EMAIL_PROVIDER as EmailProviderName) || "dummy",
  resend: {
    apiKey: process.env.RESEND_API_KEY,
    fromAddress: process.env.EMAIL_FROM_ADDRESS || "horoscope@awadhastro.com",
  },
} as const;

export function isResendConfigured(): boolean {
  return emailConfig.provider === "resend" && Boolean(emailConfig.resend.apiKey);
}
