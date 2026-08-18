import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

// Built from the edge-safe authConfig only — NOT from "@/auth" — so middleware
// (which Next.js always runs in the Edge Runtime on Vercel) never pulls in the
// Postgres driver. See auth.config.ts for the full explanation.
const { auth } = NextAuth(authConfig);

/**
 * Route protection:
 *   /account*        needs a session; if not onboarded yet, send to /onboarding.
 *   /onboarding      needs a session (can't onboard while logged out).
 *   /seva/bookings   needs a session (bookings are tied to an account now).
 *   /chat            needs a session — the founder's call: AI Astrologer chat
 *                    is login-only, unlike Kundali/Match which stay free.
 *   /login           if already signed in, always leave — to /onboarding if not
 *                    onboarded yet, otherwise to callbackUrl (or home).
 *
 * The /login rule matters for BOTH sign-in methods, not just phone-OTP: the
 * phone-OTP form has its own client-side onboarded check after verifying, but
 * Google sign-in is a full-page redirect handled entirely by NextAuth with no
 * callbackUrl set, so it lands back on whatever page the button was clicked
 * from — /login itself. Without this middleware rule, a freshly-authenticated
 * (but not yet onboarded) Google user would just see the login form render
 * again, looking like sign-in silently failed.
 */
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  if (pathname.startsWith("/account")) {
    if (!session?.user) return NextResponse.redirect(new URL("/login", req.url));
    if (!session.user.onboarded) return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  if (pathname.startsWith("/onboarding")) {
    if (!session?.user) return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname.startsWith("/seva/bookings")) {
    if (!session?.user) return NextResponse.redirect(new URL("/login?callbackUrl=/seva/bookings", req.url));
  }

  if (pathname.startsWith("/chat")) {
    if (!session?.user) return NextResponse.redirect(new URL("/login?callbackUrl=/chat", req.url));
  }

  if (pathname.startsWith("/login")) {
    if (session?.user) {
      const callbackUrl = req.nextUrl.searchParams.get("callbackUrl") || "/";
      if (!session.user.onboarded) {
        return NextResponse.redirect(new URL(`/onboarding?callbackUrl=${encodeURIComponent(callbackUrl)}`, req.url));
      }
      return NextResponse.redirect(new URL(callbackUrl, req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/account/:path*", "/onboarding/:path*", "/seva/bookings/:path*", "/chat/:path*", "/login"],
};
