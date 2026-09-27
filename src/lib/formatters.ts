import { format } from "date-fns";

/**
 * Format a number as BDT currency.
 * e.g. fmtBDT(500000) → "৳500,000"
 */
export const fmtBDT = (n: number) =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(n ?? 0);

/**
 * Format a number as BDT with 2 decimal places.
 * e.g. fmtBDTFull(500000.50) → "৳500,000.50"
 */
export const fmtBDTFull = (n: number) =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n ?? 0);

/**
 * Format a date as "DD MMM YYYY".
 * e.g. fmtDate("2026-09-27") → "27 Sep 2026"
 */
export const fmtDate = (d: string | Date) =>
  format(new Date(d), "dd MMM yyyy");

/**
 * Format a datetime as "DD MMM YYYY, hh:mm a".
 * e.g. fmtDateTime("2026-09-27T14:30:00Z") → "27 Sep 2026, 02:30 pm"
 */
export const fmtDateTime = (d: string | Date) =>
  format(new Date(d), "dd MMM yyyy, hh:mm a");

/**
 * Format a number as a percentage with 1 decimal place.
 * e.g. fmtPct(85.333) → "85.3%"
 */
export const fmtPct = (n: number) => `${(n ?? 0).toFixed(1)}%`;

/**
 * Format a plain number with thousand separators.
 * e.g. fmtNumber(1234567) → "1,234,567"
 */
export const fmtNumber = (n: number) =>
  new Intl.NumberFormat("en-BD").format(n ?? 0);

/**
 * Get user initials from a full name (up to 2 chars).
 * e.g. getInitials("Marketing A1") → "MA"
 */
export const getInitials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
