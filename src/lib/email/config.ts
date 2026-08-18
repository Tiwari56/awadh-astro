/**
 * Email provider configuration (env-driven).
 *
 * Brevo is the default real provider: its free tier covers 300 transactional
 * emails/day with no card, which is enough to run email-OTP login for an
 * early-stage product at zero cost. Resend stays supported for later.
 *
 * To go live:
 *   EMAIL_PROVIDER=brevo
 *   BREVO_API_KEY=<key from Brevo dashboard>
 *   EMAIL_FROM_ADDRESS=<a verified sender on your domain>
 */

export type EmailProviderName = "dummy" | "brevo" | "resend";

export const emailConfig = {
  provider: (process.env.EMAIL_PROVIDER as EmailProviderName) || "dummy",
  fromAddress: process.env.EMAIL_FROM_ADDRESS || "no-reply@awadhastro.com",
  fromName: process.env.EMAIL_FROM_NAME || "Awadh Astro",
  brevo: { apiKey: process.env.BREVO_API_KEY },
  resend: { apiKey: process.env.RESEND_API_KEY },
} as const;

export function isBrevoConfigured(): boolean {
  return emailConfig.provider === "brevo" && Boolean(emailConfig.brevo.apiKey);
}
export function isResendConfigured(): boolean {
  return emailConfig.provider === "resend" && Boolean(emailConfig.resend.apiKey);
}
/** True when any real (non-dummy) email provider is usable. */
export function isEmailConfigured(): boolean {
  return isBrevoConfigured() || isResendConfigured();
}
