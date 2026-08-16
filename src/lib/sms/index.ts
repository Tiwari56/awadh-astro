import { smsConfig, isMsg91Configured } from "./config";
import type { SmsProvider, SmsSendResult } from "./provider";
import { dummySmsProvider } from "./providers/dummy";
import { msg91Provider } from "./providers/msg91";

export async function sendOtpSms(phone: string, code: string): Promise<SmsSendResult> {
  const provider: SmsProvider = isMsg91Configured() ? msg91Provider : dummySmsProvider;
  try {
    return await provider.sendOtp(phone, code);
  } catch (err) {
    if (provider !== dummySmsProvider) {
      console.error("[sms] provider failed, falling back to dummy:", err);
      return dummySmsProvider.sendOtp(phone, code);
    }
    throw err;
  }
}

export { smsConfig };
