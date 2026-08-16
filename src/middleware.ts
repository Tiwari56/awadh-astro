import { NextResponse } from "next/server";
import { auth } from "@/auth";

/**
 * Route protection:
 *   /account*     needs a session; if not onboarded yet, send to /onboarding.
 *   /onboarding   needs a session (can't onboard while logged out).
 *   /login        if already signed in AND onboarded, skip straight to home.
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

  if (pathname.startsWith("/login")) {
    if (session?.user?.onboarded) return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/account/:path*", "/onboarding/:path*", "/login"],
};
