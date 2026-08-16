"use client";

/**
 * Dummy client-side booking tracker — placeholder until real accounts +
 * backend order management exist. Persists to localStorage so a devotee can
 * see what they've booked across visits on the same device/browser.
 *
 * PRODUCTION: replace with a real orders table keyed by user account, with
 * status pushed server-side by the pandit-scheduling team. Keep the
 * BookingStatus stages the same so the UI needs no changes.
 */

export type BookingStatus = "requested" | "muhurat_confirmed" | "performed" | "prasad_shipped" | "delivered";

export const BOOKING_STAGES: BookingStatus[] = ["requested", "muhurat_confirmed", "performed", "prasad_shipped", "delivered"];

export interface Booking {
  id: string;
  pujaId: string;
  pujaName: string;
  devoteeName: string;
  amountINR: number;
  status: BookingStatus;
  createdAt: number;
}

const STORAGE_KEY = "awadh-bookings";

function readAll(): Booking[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as Booking[];
  } catch {
    return [];
  }
}

function writeAll(bookings: Booking[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
}

export function addBooking(input: Omit<Booking, "id" | "status" | "createdAt">): Booking {
  const booking: Booking = {
    ...input,
    id: crypto.randomUUID(),
    // New bookings start further along than "just requested" so the demo
    // tracker has something to show immediately — a real backend would start
    // every booking at "requested" and progress it as the pandit team confirms.
    status: "muhurat_confirmed",
    createdAt: Date.now(),
  };
  const all = readAll();
  all.unshift(booking);
  writeAll(all);
  return booking;
}

export function getBookings(): Booking[] {
  return readAll();
}
