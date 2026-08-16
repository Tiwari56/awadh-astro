import type { SmsProvider, SmsSendResult } from "../provider";
import { smsConfig } from "../config";

/**
 * NOT IMPLEMENTED — template for real OTP delivery via MSG91.
 *
 * To wire this up:
 *   1. Create an MSG91 account, complete DLT template registration
 *      (mandatory for Indian SMS — templates must be pre-approved).
 *   2. Set MSG91_AUTH_KEY and MSG91_TEMPLATE_ID, and SMS_PROVIDER=msg91.
 *   3. Replace the body below with a call to MSG91's OTP API:
 *        POST https://control.msg91.com/api/v5/otp
 *        headers: { authkey: smsConfig.msg91.authKey }
 *        body: { template_id, mobile: phone, otp: code }
 *      (MSG91 can also generate+verify the OTP server-side instead of us
 *      doing it — either approach works; keep whichever this function
 *      returns compatible with the SmsProvider interface.)
 */
export const msg91Provider: SmsProvider = {
  name: "msg91",
  async sendOtp(phone: string, code: string): Promise<SmsSendResult> {
    void phone;
    void code;
    void smsConfig.msg91.authKey;
    throw new Error(
      "msg91Provider is not implemented yet — see the TODO block in src/lib/sms/providers/msg91.ts. " +
      "Set SMS_PROVIDER=dummy (or leave unset) until this is wired."
    );
  },
};
