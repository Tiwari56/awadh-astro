import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe half of the Auth.js config — no adapter, no Node-only imports
 * (Postgres driver, Drizzle). This is what middleware.ts uses, since
 * middleware runs in the Edge Runtime on Vercel and cannot load 'postgres'
 * (which needs 'net'/'fs'/'tls'). The full config with the DrizzleAdapter and
 * the DB-backed Credentials provider lives in auth.ts, used everywhere else
 * (API routes, server components — all Node.js runtime).
 */
export const authConfig = {
  trustHost: true,
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.uid = user.id;
        token.phone = (user as { phone?: string | null }).phone ?? null;
        token.role = (user as { role?: string }).role ?? "user";
        token.onboarded = (user as { onboarded?: boolean }).onboarded ?? false;
      }
      // Allows client-side session.update() (e.g. right after onboarding finishes)
      // to refresh the token without forcing a full re-login.
      if (trigger === "update" && session) {
        Object.assign(token, session);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.uid as string;
        session.user.phone = token.phone as string | null;
        session.user.role = token.role as "user" | "astrologer" | "admin";
        session.user.onboarded = token.onboarded as boolean;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
