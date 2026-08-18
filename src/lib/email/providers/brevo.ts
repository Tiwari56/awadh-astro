import { emailConfig } from "../config";
import type { DailyHoroscopeSignup, EmailProvider, EmailSendResult, TransactionalEmail } from "../provider";

/**
 * Brevo (formerly Sendinblue) transactional email.
 *
 * Chosen because its free tier covers 300 transactional emails/day with no
 * card required, which is enough to run email-OTP login for an early-stage
 * product at zero cost. Plain REST via fetch — no SDK dependency.
 *
 * Docs: POST https://api.brevo.com/v3/smtp/email  (header: api-key)
 */
const ENDPOINT = "https://api.brevo.com/v3/smtp/email";

async function brevoSend(email: TransactionalEmail): Promise<EmailSendResult> {
  const apiKey = emailConfig.brevo.apiKey;
  if (!apiKey) return { ok: false, error: "BREVO_API_KEY is not set" };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: { email: emailConfig.fromAddress, name: emailConfig.fromName },
        to: [{ email: email.to }],
        subject: email.subject,
        textContent: email.text,
        ...(email.html ? { htmlContent: email.html } : {}),
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const body = await res.text();
      return { ok: false, error: `Brevo ${res.status}: ${body.slice(0, 300)}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Brevo request failed" };
  } finally {
    clearTimeout(timer);
  }
}

export const brevoEmailProvider: EmailProvider = {
  name: "brevo",
  async send(email: TransactionalEmail): Promise<EmailSendResult> {
    return brevoSend(email);
  },
  async sendDailyHoroscopeSignupConfirmation(signup: DailyHoroscopeSignup): Promise<EmailSendResult> {
    return brevoSend({
      to: signup.email,
      subject: "Your daily horoscope from Awadh Astro 🪔",
      text: [
        `Namaste${signup.name ? ` ${signup.name}` : ""} 🙏`,
        "",
        `You're signed up for your daily horoscope, arriving around ${signup.preferredTime}.`,
        "",
        "— Awadh Astro, Ayodhya",
      ].join("\n"),
    });
  },
};
