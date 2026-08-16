import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

/**
 * Neon's HTTP driver — no long-lived TCP connection, so it works cleanly
 * across many concurrent short-lived Vercel serverless invocations without
 * exhausting Postgres's connection limit (the classic serverless-Postgres
 * problem). Requires the pooled DATABASE_URL from the Neon/Vercel Postgres
 * integration. We don't use db.transaction() anywhere, so neon-http's lack
 * of interactive multi-statement transactions isn't a limitation here.
 */
// neon()'s own validator requires the "postgresql://" scheme specifically
// (not the "postgres://" short form many other pg clients accept) — using
// the wrong scheme here throws at import time, which crashes the whole
// Next.js build during "Collecting page data" (every route module gets
// imported to be inspected, running this top-level code).
const connectionString = process.env.DATABASE_URL ?? "postgresql://user:pass@localhost:5432/awadh_astro_dev";

const sql = neon(connectionString);
export const db = drizzle(sql, { schema });
