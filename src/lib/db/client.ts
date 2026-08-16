import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Postgres connection. DATABASE_URL points at local dev Postgres by default
 * (see .env.example) — swap it for a hosted Postgres (Supabase/Neon/RDS,
 * pick one with a Mumbai region for DPDP data-residency) for staging/prod.
 * No other code changes needed when you do.
 */
const connectionString = process.env.DATABASE_URL ?? "postgres://localhost:5432/awadh_astro_dev";

const client = postgres(connectionString);
export const db = drizzle(client, { schema });
