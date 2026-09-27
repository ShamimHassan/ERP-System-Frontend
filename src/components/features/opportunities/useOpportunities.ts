"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api-client";
import type { Opportunity, PaginationMeta } from "@/types/api.types";

interface OpportunitiesResponse { data: Opportunity[]; meta: PaginationMeta; }

export function useOpportunities(params: Record<string, unknown>) {
  return useQuery<OpportunitiesResponse>({
    queryKey: ["opportunities", params],
    queryFn: async () => {
      const res = await api.get("/opportunities", { params }) as unknown;
      if (Array.isArray(res)) return { data: res as Opportunity[], meta: { page: 1, limit: 20, total: (res as Opportunity[]).length, totalPages: 1 } };
      return res as OpportunitiesResponse;
    },
    placeholderData: (prev) => prev,
  });
}

export function useOpportunity(id: string) {
  return useQuery<Opportunity>({
    queryKey: ["opportunities", id],
    queryFn: () => api.get(`/opportunities/${id}`) as unknown as Promise<Opportunity>,
    enabled: !!id,
    retry: (count, err: unknown) => {
      if ((err as { response?: { status?: number } })?.response?.status === 404) return false;
      return count < 1;
    },
  });
}

export function useCreateOpportunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => api.post("/opportunities", body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["opportunities"] }); toast.success("Opportunity created."); },
    onError: (err: unknown) => toast.error((err as { message?: string })?.message ?? "Failed to create opportunity."),
  });
}

export function useUpdateOpportunity(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => api.patch(`/opportunities/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["opportunities"] });
      qc.invalidateQueries({ queryKey: ["opportunities", id] });
      toast.success("Opportunity updated.");
    },
    onError: (err: unknown) => toast.error((err as { message?: string })?.message ?? "Failed to update opportunity."),
  });
}
