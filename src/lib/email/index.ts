import { emailConfig, isResendConfigured } from "./config";
import type { DailyHoroscopeSignup, EmailProvider, EmailSendResult } from "./provider";
import { dummyEmailProvider } from "./providers/dummy";
import { resendEmailProvider } from "./providers/resend";

/** Entry point — mirrors astrology/index.ts and ai/index.ts's dispatch + fallback pattern. */
export async function sendDailyHoroscopeSignupConfirmation(signup: DailyHoroscopeSignup): Promise<EmailSendResult> {
  const provider: EmailProvider = isResendConfigured() ? resendEmailProvider : dummyEmailProvider;
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

export { emailConfig };
export type { DailyHoroscopeSignup } from "./provider";
