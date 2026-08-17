import type { DailyHoroscopeSignup, EmailProvider, EmailSendResult, TransactionalEmail } from "../provider";

/**
 * Dummy provider — logs instead of sending, always succeeds. Lets the whole
 * signup flow (form → API route → "confirmation sent" UI) be built and
 * demoed today without an email API key. No email is actually delivered.
 */
export const dummyEmailProvider: EmailProvider = {
  name: "dummy",
  async sendDailyHoroscopeSignupConfirmation(signup: DailyHoroscopeSignup): Promise<EmailSendResult> {
    console.log(`[email:dummy] Would send daily-horoscope confirmation to ${signup.email} (preferred time: ${signup.preferredTime})`);
    return { ok: true };
  },
  async send(email: TransactionalEmail): Promise<EmailSendResult> {
    console.log(`[email:dummy] Would send "${email.subject}" to ${email.to}\n${email.text}`);
    return { ok: true };
  },
};
