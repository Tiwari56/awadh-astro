import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq, and, gt, desc } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users, accounts, sessions, verificationTokens, otpCodes } from "@/lib/db/schema";
import { authConfig } from "@/auth.config";

/**
 * Full Auth.js config — Node.js runtime only (API routes, server components).
 * Extends authConfig (see that file for why the split exists) with the
 * DrizzleAdapter and the DB-backed phone-OTP Credentials provider.
 *
 * Google is only registered when AUTH_GOOGLE_ID/SECRET are set, so the
 * button on /login can hide itself instead of dead-ending into an OAuth
 * error — exactly the founder's brief ("keep Google for now, I'll provide
 * keys"). Facebook/Apple are intentionally NOT registered here at all; the
 * /login page shows them as visually-present "Coming Soon" buttons only.
 */
const googleConfigured = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: DrizzleAdapter(db, { usersTable: users, accountsTable: accounts, sessionsTable: sessions, verificationTokensTable: verificationTokens }),
  providers: [
    ...(googleConfigured ? [Google] : []),
    Credentials({
      id: "phone-otp",
      name: "Phone OTP",
      credentials: {
        // `identifier` is a phone number or an email address; `channel` says which.
        identifier: { label: "Phone or Email", type: "text" },
        channel: { label: "Channel", type: "text" },
        code: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        const identifier = (credentials?.identifier as string | undefined)?.trim();
        const code = credentials?.code as string | undefined;
        const channel = (credentials?.channel as string | undefined) === "email" ? "email" : "sms";
        if (!identifier || !code) return null;

        const now = new Date();
        const [otp] = await db
          .select()
          .from(otpCodes)
          .where(and(
            eq(otpCodes.identifier, identifier),
            eq(otpCodes.code, code),
            eq(otpCodes.consumed, false),
            gt(otpCodes.expiresAt, now),
          ))
          .orderBy(desc(otpCodes.createdAt))
          .limit(1);

        if (!otp) return null; // wrong/expired/already-used code
        await db.update(otpCodes).set({ consumed: true }).where(eq(otpCodes.id, otp.id));

        // Find-or-create by whichever identifier was verified.
        const column = channel === "email" ? users.email : users.phone;
        let [user] = await db.select().from(users).where(eq(column, identifier)).limit(1);
        if (!user) {
          [user] = await db
            .insert(users)
            .values(channel === "email"
              ? { email: identifier, emailVerified: new Date() }
              : { phone: identifier })
            .returning();
        } else if (channel === "email" && !user.emailVerified) {
          await db.update(users).set({ emailVerified: new Date() }).where(eq(users.id, user.id));
        }

        return { id: user.id, phone: user.phone, email: user.email, role: user.role, plan: user.plan, name: user.name, onboarded: user.onboarded };
      },
    }),
  ],
});
