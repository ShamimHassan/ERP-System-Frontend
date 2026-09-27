import { format } from "date-fns";

export const fmtBDT = (n: number) =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(n ?? 0);

export const fmtDate = (d: string | Date) =>
  format(new Date(d), "dd MMM yyyy");

export const fmtDateTime = (d: string | Date) =>
  format(new Date(d), "dd MMM yyyy, hh:mm a");

export const fmtPct = (n: number) => `${n.toFixed(1)}%`;
