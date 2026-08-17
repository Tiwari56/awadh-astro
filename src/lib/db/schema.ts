import { relations, sql } from "drizzle-orm";
import {
  boolean, index, integer, jsonb, pgEnum, pgTable, primaryKey, text, timestamp, varchar,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

/**
 * Schema for Postgres (via Drizzle). Covers auth (Auth.js-shaped users/
 * accounts/sessions/verificationTokens tables, extended with our own
 * columns) + the app's own domain tables: profiles, addresses, wallets,
 * astrologer profiles, saved kundalis, and bookings.
 *
 * Astrologer earnings/payouts are intentionally NOT modeled as a real
 * ledger yet — commissionPercent on astrologer_profiles is illustrative
 * (mirrors an AstroTalk-style revenue split), and actual payout processing
 * is real fintech infrastructure for a later phase, not this pass.
 */

export const roleEnum = pgEnum("role", ["user", "astrologer", "admin"]);
export const planEnum = pgEnum("plan", ["free", "plus"]);
export const genderEnum = pgEnum("gender", ["male", "female", "other"]);
export const consultModeEnum = pgEnum("consult_mode", ["online", "in-person"]);
export const astrologerStatusEnum = pgEnum("astrologer_status", ["online", "busy", "offline"]);
export const bookingStatusEnum = pgEnum("booking_status", [
  "requested", "muhurat_confirmed", "performed", "prasad_shipped", "delivered",
]);
export const bookingModeEnum = pgEnum("booking_mode", ["online", "offline"]);
export const walletTxnTypeEnum = pgEnum("wallet_txn_type", ["credit", "debit"]);

// --- Auth.js-required tables (DrizzleAdapter shape), extended with our columns ---

export const users = pgTable("users", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),

  // Our own fields.
  phone: varchar("phone", { length: 20 }).unique(), // primary identifier per the founder's brief
  role: roleEnum("role").notNull().default("user"),
  plan: planEnum("plan").notNull().default("free"),
  onboarded: boolean("onboarded").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
}, (t) => ({
  // Admin dashboard segments users by role/plan and charts signups over time;
  // without these every such query is a full table scan.
  roleIdx: index("users_role_idx").on(t.role),
  planIdx: index("users_plan_idx").on(t.plan),
  createdAtIdx: index("users_created_at_idx").on(t.createdAt),
}));

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.provider, table.providerAccountId] }),
    userIdx: index("accounts_user_idx").on(table.userId),
  })
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (table) => ({ pk: primaryKey({ columns: [table.identifier, table.token] }) })
);

// --- Phone OTP (separate from Auth.js's email-shaped verificationTokens) ---

export const otpCodes = pgTable("otp_codes", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  phone: varchar("phone", { length: 20 }).notNull(),
  code: varchar("code", { length: 6 }).notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  consumed: boolean("consumed").notNull().default(false),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
}, (t) => ({
  // Every single sign-in runs the phone+consumed+expiry lookup in authorize().
  phoneConsumedIdx: index("otp_codes_phone_consumed_idx").on(t.phone, t.consumed),
  expiresAtIdx: index("otp_codes_expires_at_idx").on(t.expiresAt),
}));

// --- Domain tables ---

export const profiles = pgTable("profiles", {
  userId: text("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  gender: genderEnum("gender"),
  dateOfBirth: varchar("date_of_birth", { length: 10 }), // YYYY-MM-DD
  timeOfBirth: varchar("time_of_birth", { length: 5 }), // HH:mm
  timeUnknown: boolean("time_unknown").notNull().default(false),
  placeOfBirth: text("place_of_birth"),
});

export const addresses = pgTable("addresses", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  label: text("label").default("Home"),
  line1: text("line1").notNull(),
  city: text("city").notNull(),
  state: text("state"),
  country: text("country").notNull().default("India"),
  pincode: varchar("pincode", { length: 12 }),
  isDefault: boolean("is_default").notNull().default(true),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
}, (t) => ({
  userIdx: index("addresses_user_idx").on(t.userId),
  cityIdx: index("addresses_city_idx").on(t.city), // serviceability / delivery reporting
}));

export const wallets = pgTable("wallets", {
  userId: text("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  balanceINR: integer("balance_inr").notNull().default(0),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const walletTransactions = pgTable("wallet_transactions", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  amountINR: integer("amount_inr").notNull(),
  type: walletTxnTypeEnum("type").notNull(),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
}, (t) => ({
  userCreatedIdx: index("wallet_txn_user_created_idx").on(t.userId, t.createdAt),
  typeIdx: index("wallet_txn_type_idx").on(t.type), // revenue/credit reporting
}));

/**
 * Illustrative AstroTalk-style commission split — NOT an exact copy, just
 * "similar type of model" per the brief: platform takes a commission per
 * consultation, astrologer keeps the rest. No real payout ledger yet.
 */
export const astrologerProfiles = pgTable("astrologer_profiles", {
  userId: text("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  specialties: jsonb("specialties").$type<string[]>().notNull().default([]),
  languages: jsonb("languages").$type<string[]>().notNull().default([]),
  experienceYears: integer("experience_years").notNull().default(0),
  ratePerMinINR: integer("rate_per_min_inr").notNull().default(20),
  bio: text("bio"),
  ayodhyaVerified: boolean("ayodhya_verified").notNull().default(false),
  consultModes: jsonb("consult_modes").$type<string[]>().notNull().default(["online"]),
  status: astrologerStatusEnum("status").notNull().default("offline"),
  commissionPercent: integer("commission_percent").notNull().default(30), // platform's cut
  totalConsults: integer("total_consults").notNull().default(0),
  rating: integer("rating_x10").notNull().default(0), // stored as rating*10 to avoid float column
}, (t) => ({
  // Astrologer directory filters on availability and sorts by rating.
  statusIdx: index("astrologer_status_idx").on(t.status),
  ratingIdx: index("astrologer_rating_idx").on(t.rating),
  verifiedIdx: index("astrologer_verified_idx").on(t.ayodhyaVerified),
}));

export const kundaliRecords = pgTable("kundali_records", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  subjectName: text("subject_name").notNull(),
  dateOfBirth: varchar("date_of_birth", { length: 10 }).notNull(),
  timeOfBirth: varchar("time_of_birth", { length: 5 }).notNull(),
  timeUnknown: boolean("time_unknown").notNull().default(false),
  placeOfBirth: text("place_of_birth").notNull(),
  resultJson: jsonb("result_json").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
}, (t) => ({
  // Account page and chat grounding both fetch "this user's latest kundali".
  userCreatedIdx: index("kundali_user_created_idx").on(t.userId, t.createdAt),
}));

export const bookings = pgTable("bookings", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  pujaId: text("puja_id").notNull(),
  pujaName: text("puja_name").notNull(),
  devoteeName: text("devotee_name").notNull(),
  amountINR: integer("amount_inr").notNull(),
  mode: bookingModeEnum("mode").notNull().default("online"),
  status: bookingStatusEnum("status").notNull().default("muhurat_confirmed"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
}, (t) => ({
  userCreatedIdx: index("bookings_user_created_idx").on(t.userId, t.createdAt),
  // Admin dashboard: fulfilment queue by stage, revenue by puja, volume over time.
  statusIdx: index("bookings_status_idx").on(t.status),
  pujaIdx: index("bookings_puja_idx").on(t.pujaId),
  createdAtIdx: index("bookings_created_at_idx").on(t.createdAt),
}));

// --- Relations (for query ergonomics) ---

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, { fields: [users.id], references: [profiles.userId] }),
  wallet: one(wallets, { fields: [users.id], references: [wallets.userId] }),
  astrologerProfile: one(astrologerProfiles, { fields: [users.id], references: [astrologerProfiles.userId] }),
  addresses: many(addresses),
  kundaliRecords: many(kundaliRecords),
  bookings: many(bookings),
  walletTransactions: many(walletTransactions),
}));
