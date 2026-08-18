import { emailConfig, isBrevoConfigured, isEmailConfigured, isResendConfigured } from "./config";
import type { DailyHoroscopeSignup, EmailProvider, EmailSendResult, TransactionalEmail } from "./provider";
import { dummyEmailProvider } from "./providers/dummy";
import { brevoEmailProvider } from "./providers/brevo";
import { resendEmailProvider } from "./providers/resend";

function activeProvider(): EmailProvider {
  if (isBrevoConfigured()) return brevoEmailProvider;
  if (isResendConfigured()) return resendEmailProvider;
  return dummyEmailProvider;
}

/** Entry point — mirrors astrology/index.ts and ai/index.ts's dispatch + fallback pattern. */
export async function sendDailyHoroscopeSignupConfirmation(signup: DailyHoroscopeSignup): Promise<EmailSendResult> {
  const provider = activeProvider();
  try {
    return await provider.sendDailyHoroscopeSignupConfirmation(signup);
  } catch (err) {
    if (provider !== dummyEmailProvider) {
      console.error("[email] provider failed, falling back to dummy:", err);
      return dummyEmailProvider.sendDailyHoroscopeSignupConfirmation(signup);
    }
    throw err;
  }
}

/** Generic transactional send (login OTP). Never silently falls back — the
 *  caller needs to know whether a real email actually went out. */
export async function sendTransactionalEmail(email: TransactionalEmail): Promise<EmailSendResult> {
  return activeProvider().send(email);
}

export { emailConfig, isEmailConfigured };
export type { DailyHoroscopeSignup, TransactionalEmail } from "./provider";
