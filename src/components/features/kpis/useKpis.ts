"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api-client";
import type { KpiRow, PaginationMeta } from "@/types/api.types";

interface KpisResponse {
  rows: KpiRow[];
  meta: { count: number; periodType: string; periodStart: string };
}

interface TargetRow {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  periodType: string;
  periodStart: string;
  periodEnd: string;
  metric: string;
  targetValue: number;
}

interface TargetsResponse {
  data: TargetRow[];
  meta: PaginationMeta;
}

// GET /api/kpis — actual vs target rows
export function useKpis(params: Record<string, unknown> = {}) {
  return useQuery<KpisResponse>({
    queryKey: ["kpis", params],
    queryFn: async () => {
      const res = await api.get("/kpis", { params }) as unknown;
      // api-client unwraps envelope: rows + meta come as the data field
      // but the response shape is { rows, meta } not { data: ..., meta: ... }
      return res as KpisResponse;
    },
    placeholderData: (prev) => prev,
  });
}

// GET /api/kpis/targets — raw target rows
export function useKpiTargets(params: Record<string, unknown> = {}) {
  return useQuery<TargetsResponse>({
    queryKey: ["kpi-targets", params],
    queryFn: async () => {
      const res = await api.get("/kpis/targets", { params }) as unknown;
      if (Array.isArray(res)) return { data: res as TargetRow[], meta: { page: 1, limit: 50, total: (res as TargetRow[]).length, totalPages: 1 } };
      return res as TargetsResponse;
    },
  });
}

// POST /api/kpis/targets — upsert a target
export function useSetKpiTarget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      userId: string;
      periodType: string;
      periodStart: string;
      metric: string;
      targetValue: number;
    }) => api.post("/kpis/targets", body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["kpis"] });
      qc.invalidateQueries({ queryKey: ["kpi-targets"] });
      toast.success("Target saved.");
    },
    onError: (err: unknown) => toast.error((err as { message?: string })?.message ?? "Failed to save target."),
  });
}
