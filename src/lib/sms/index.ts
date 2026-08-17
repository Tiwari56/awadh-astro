import { smsConfig, isMsg91Configured, isBrevoSmsConfigured } from "./config";
import type { SmsProvider, SmsSendResult } from "./provider";
import { dummySmsProvider } from "./providers/dummy";
import { msg91Provider } from "./providers/msg91";
import { brevoSmsProvider } from "./providers/brevo";

export async function sendOtpSms(phone: string, code: string): Promise<SmsSendResult> {
  const provider: SmsProvider = isMsg91Configured()
    ? msg91Provider
    : isBrevoSmsConfigured()
      ? brevoSmsProvider
      : dummySmsProvider;
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
