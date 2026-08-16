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
const connectionString = process.env.DATABASE_URL ?? "postgres://localhost:5432/awadh_astro_dev";

const sql = neon(connectionString);
export const db = drizzle(sql, { schema });
