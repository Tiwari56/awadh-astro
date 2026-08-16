export interface SmsSendResult {
  ok: boolean;
  /** Only ever populated by the dummy provider in non-production — see providers/dummy.ts. */
  devCode?: string;
}

/** Provider contract — same pattern as astrology/, ai/, and email/. */
export interface SmsProvider {
  readonly name: string;
  sendOtp(phone: string, code: string): Promise<SmsSendResult>;
}
