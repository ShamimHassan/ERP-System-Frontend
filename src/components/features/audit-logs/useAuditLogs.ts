"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api-client";
import type { AuditLog, PaginationMeta } from "@/types/api.types";

interface AuditLogsResponse { data: AuditLog[]; meta: PaginationMeta; }

export function useAuditLogs(params: Record<string, unknown> = {}) {
  return useQuery<AuditLogsResponse>({
    queryKey: ["audit-logs", params],
    queryFn: async () => {
      const res = await api.get("/audit-logs", { params }) as unknown;
      if (res && typeof res === "object" && "data" in (res as object) && "meta" in (res as object)) return res as AuditLogsResponse;
      if (Array.isArray(res)) return { data: res as AuditLog[], meta: { page: 1, limit: 20, total: (res as AuditLog[]).length, totalPages: 1 } };
      return res as AuditLogsResponse;
    },
    placeholderData: (prev) => prev,
  });
}
