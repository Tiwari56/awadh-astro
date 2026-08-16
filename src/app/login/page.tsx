import { Suspense } from "react";
import LoginForm from "./LoginForm";

/** Server component so we can check Google's configuration without leaking the secret to the client. */
export default function LoginPage() {
  const googleEnabled = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
  return (
    <Suspense>
      <LoginForm googleEnabled={googleEnabled} />
    </Suspense>
  );
}
