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
 *   /login           if already signed in AND onboarded, skip straight to home.
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

  if (pathname.startsWith("/login")) {
    if (session?.user?.onboarded) return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/account/:path*", "/onboarding/:path*", "/seva/bookings/:path*", "/login"],
};
