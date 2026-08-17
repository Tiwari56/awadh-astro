/**
 * OTP delivery policy.
 *
 * `allowTestCode` controls whether /api/auth/otp/request may return the code
 * in its JSON response so a tester can sign in without receiving a real
 * SMS/email. This is a genuine security tradeoff — anyone who can call the
 * endpoint can then sign in as that identifier — so it is deliberately:
 *
 *   - OFF by default in production,
 *   - ON by default outside production (local dev convenience),
 *   - only forceable in production via an explicit OTP_ALLOW_TEST_CODE=true,
 *   - and ignored entirely once a real provider actually delivered the code
 *     (see the `delivered` check at the call site).
 *
 * Turn OTP_ALLOW_TEST_CODE off the moment real users are on the platform.
 */
export const otpDeliveryConfig = {
  allowTestCode:
    process.env.OTP_ALLOW_TEST_CODE === "true" ||
    (process.env.NODE_ENV !== "production" && process.env.OTP_ALLOW_TEST_CODE !== "false"),
} as const;
