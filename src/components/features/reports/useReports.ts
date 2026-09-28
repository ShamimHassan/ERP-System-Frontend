"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api-client";

// ── Sales Report types ────────────────────────────────────────────────────
export type SalesGroupBy = "month" | "product" | "service" | "category" | "person" | "manager" | "customer";

export interface SalesReportRow {
  key:           string;
  label:         string;
  ordersCount:   number;
  itemsCount:    number;
  grandTotal:    number;
  avgOrderValue: number;
}

export interface SalesReportResponse {
  groupBy: string;
  rows:    SalesReportRow[];
  totals: {
    ordersTotal:  number;
    itemsTotal:   number;
    revenueTotal: number;
  };
}

// ── Marketing Report types ────────────────────────────────────────────────
export interface MarketingReportResponse {
  dateRange: { from: string | null; to: string | null };
  leads: {
    total:    number;
    byStatus: Record<string, number>;
    won:      number;
  };
  opportunities: {
    total:         number;
    pipelineValue: number;
    byStage:       Record<string, { count: number; value: number }>;
  };
  conversionRates: {
    leadsToQualified: number;
    leadsToWon:       number;
    qualifiedToWon:   number;
  };
  funnel: Array<{ stage: string; value: number }>;
  activities: {
    total:     number;
    byType:    Record<string, number>;
    followUps: number;
    calls:     number;
    meetings:  number;
  };
  surveys: {
    total:          number;
    completed:      number;
    completionRate: number;
    byStatus:       Record<string, number>;
  };
}

// ── Hooks ─────────────────────────────────────────────────────────────────

export function useSalesReport(params: Record<string, unknown> = {}) {
  return useQuery<SalesReportResponse>({
    queryKey: ["reports-sales", params],
    queryFn: async () => {
      const res = await api.get("/reports/sales", { params }) as unknown;
      return res as SalesReportResponse;
    },
    placeholderData: (prev) => prev,
  });
}

export function useMarketingReport(params: Record<string, unknown> = {}) {
  return useQuery<MarketingReportResponse>({
    queryKey: ["reports-marketing", params],
    queryFn: async () => {
      const res = await api.get("/reports/marketing", { params }) as unknown;
      return res as MarketingReportResponse;
    },
    placeholderData: (prev) => prev,
  });
}
