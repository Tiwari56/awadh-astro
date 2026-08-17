import type { DailyHoroscopeSignup, EmailProvider, EmailSendResult, TransactionalEmail } from "../provider";
import { emailConfig } from "../config";

/**
 * NOT IMPLEMENTED — template for real email delivery via Resend
 * (resend.com — simple API, good deliverability, common Next.js pairing).
 * Swap for SendGrid/Postmark/SES the same way if preferred; keep the change
 * inside this one file.
 *
 * To wire this up:
 *   1. npm install resend
 *   2. Set RESEND_API_KEY and EMAIL_PROVIDER=resend in the environment.
 *   3. Replace the body below with:
 *        import { Resend } from "resend";
 *        const resend = new Resend(emailConfig.resend.apiKey);
 *        await resend.emails.send({
 *          from: emailConfig.resend.fromAddress,
 *          to: signup.email,
 *          subject: "Your daily horoscope is set up 🙏",
 *          html: renderConfirmationEmail(signup), // build a devotional-styled template
 *        });
 *   4. Also wire the ACTUAL daily send (a cron job / scheduled function that
 *      queries subscribed users and sends each one their horoscope at their
 *      preferredTime) — this file only covers the signup-confirmation email,
 *      not the recurring daily send, which needs a scheduler + a saved
 *      subscriber list (currently only in localStorage on the client, see
 *      the chat page's UpsellCard — that needs to move server-side with
 *      real accounts before recurring email can work).
 */
export const resendEmailProvider: EmailProvider = {
  name: "resend",
  async sendDailyHoroscopeSignupConfirmation(signup: DailyHoroscopeSignup): Promise<EmailSendResult> {
    void signup;
    void emailConfig.resend.apiKey;
    throw new Error(
      "resendEmailProvider is not implemented yet — see the TODO block in src/lib/email/providers/resend.ts. " +
      "Set EMAIL_PROVIDER=dummy (or leave unset) until this is wired."
    );
  },
  async send(_email: TransactionalEmail): Promise<EmailSendResult> {
    throw new Error("resendEmailProvider.send is not implemented — use EMAIL_PROVIDER=brevo, or implement this.");
  },
};
