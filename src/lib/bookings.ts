/**
 * Booking status pipeline shared by the Seva booking flow and the account
 * bookings list — the real source of truth is the `bookings` table
 * (src/lib/db/schema.ts) and /api/bookings, but the stage list/order lives
 * here since it's pure UI/display config, not persisted state.
 */
export type BookingStatus = "requested" | "muhurat_confirmed" | "performed" | "prasad_shipped" | "delivered";

export const BOOKING_STAGES: BookingStatus[] = ["requested", "muhurat_confirmed", "performed", "prasad_shipped", "delivered"];
