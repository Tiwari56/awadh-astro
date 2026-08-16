import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq, and, gt } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users, accounts, sessions, verificationTokens, otpCodes } from "@/lib/db/schema";

/**
 * Auth.js config. Session strategy MUST be "jwt" — the Credentials provider
 * (phone OTP) doesn't support database sessions. The DrizzleAdapter still
 * persists users/accounts for the Google OAuth path.
 *
 * Google is only registered when AUTH_GOOGLE_ID/SECRET are set, so the
 * button on /login can hide itself instead of dead-ending into an OAuth
 * error — exactly the founder's brief ("keep Google for now, I'll provide
 * keys"). Facebook/Apple are intentionally NOT registered here at all; the
 * /login page shows them as visually-present "Coming Soon" buttons only.
 */
const googleConfigured = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

export const { handlers, signIn, signOut, auth } = NextAuth({
  // Required when self-hosting (not on Vercel) — otherwise Auth.js rejects
  // every request as an "untrusted host" in production mode.
  trustHost: true,
  adapter: DrizzleAdapter(db, { usersTable: users, accountsTable: accounts, sessionsTable: sessions, verificationTokensTable: verificationTokens }),
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    ...(googleConfigured ? [Google] : []),
    Credentials({
      id: "phone-otp",
      name: "Phone OTP",
      credentials: {
        phone: { label: "Phone", type: "text" },
        code: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        const phone = credentials?.phone as string | undefined;
        const code = credentials?.code as string | undefined;
        if (!phone || !code) return null;

        const now = new Date();
        const [otp] = await db
          .select()
          .from(otpCodes)
          .where(and(eq(otpCodes.phone, phone), eq(otpCodes.code, code), eq(otpCodes.consumed, false), gt(otpCodes.expiresAt, now)))
          .orderBy(otpCodes.createdAt)
          .limit(1);

        if (!otp) return null; // wrong/expired/already-used code
        await db.update(otpCodes).set({ consumed: true }).where(eq(otpCodes.id, otp.id));

        let [user] = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
        if (!user) {
          [user] = await db.insert(users).values({ phone }).returning();
        }

        return { id: user.id, phone: user.phone, role: user.role, name: user.name, onboarded: user.onboarded };
      },
    }),
  ],
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
});
