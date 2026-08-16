import type { Config } from "drizzle-kit";

export default {
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Unpooled preferred for schema pushes — DDL over a pgbouncer-pooled
    // connection (Neon's default DATABASE_URL) can be flaky.
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "postgresql://user:pass@localhost:5432/awadh_astro_dev",
  },
} satisfies Config;
