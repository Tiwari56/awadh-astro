import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      phone: string | null;
      role: "user" | "astrologer" | "admin";
      plan: "free" | "plus";
      onboarded: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid?: string;
    phone?: string | null;
    role?: "user" | "astrologer" | "admin";
    plan?: "free" | "plus";
    onboarded?: boolean;
  }
}
