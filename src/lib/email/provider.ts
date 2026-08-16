export interface DailyHoroscopeSignup {
  email: string;
  preferredTime: string; // e.g. "7:00 AM"
  name?: string;
}

export interface EmailSendResult {
  ok: boolean;
  error?: string;
}

/**
 * Provider contract — mirrors astrology/provider.ts and ai/provider.ts's
 * pattern so all three swappable-backend seams in this codebase look the
 * same. Swap providers/dummy.ts for a real provider (Resend/SendGrid/
 * Postmark/SES) once one is chosen; the rest of the app never changes.
 */
export interface EmailProvider {
  readonly name: string;
  sendDailyHoroscopeSignupConfirmation(signup: DailyHoroscopeSignup): Promise<EmailSendResult>;
}
