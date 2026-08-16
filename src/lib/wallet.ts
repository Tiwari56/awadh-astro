"use client";

/**
 * Dummy in-browser wallet — placeholder for the real payment system.
 *
 * PRODUCTION: once account management (phone-OTP sign-in) exists, replace
 * this with a real server-side wallet ledger, funded via Razorpay top-ups.
 * Keep the function signatures the same (getBalance/deduct/credit) so the
 * booking flow that calls this doesn't need to change — only the storage
 * and the "who is this wallet for" question change once there are accounts.
 */

const BALANCE_KEY = "awadh-wallet-balance";
const STARTING_BALANCE = 5000; // illustrative — a fresh browser "has" ₹5,000 to demo the flow

export function getWalletBalance(): number {
  if (typeof window === "undefined") return STARTING_BALANCE;
  const stored = localStorage.getItem(BALANCE_KEY);
  if (stored === null) {
    localStorage.setItem(BALANCE_KEY, String(STARTING_BALANCE));
    return STARTING_BALANCE;
  }
  return Number(stored);
}

export function deductFromWallet(amount: number): { ok: boolean; balance: number } {
  const balance = getWalletBalance();
  if (balance < amount) return { ok: false, balance };
  const next = balance - amount;
  localStorage.setItem(BALANCE_KEY, String(next));
  return { ok: true, balance: next };
}
