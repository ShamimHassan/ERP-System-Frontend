"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/api-client";
import type { Lead, PaginationMeta } from "@/types/api.types";

// ── Response shapes ───────────────────────────────────────────────────────

interface LeadsResponse {
  data: Lead[];
  meta: PaginationMeta;
}

interface ConvertResponse {
  customerId: string;
  leadId: string;
  leadStatus: string;
}

// ── Query hooks ───────────────────────────────────────────────────────────

/** List leads with optional search/filter/pagination params */
export function useLeads(params: Record<string, unknown>) {
  return useQuery<LeadsResponse>({
    queryKey: ["leads", params],
    queryFn: async () => {
      const res = await api.get("/leads", { params }) as unknown;
      // Interceptor returns { data: Lead[], meta } for paginated responses
      if (res && typeof res === "object" && "data" in (res as object) && "meta" in (res as object)) {
        return res as LeadsResponse;
      }
      if (Array.isArray(res)) return { data: res as Lead[], meta: { page: 1, limit: 20, total: (res as Lead[]).length, totalPages: 1 } };
      return res as LeadsResponse;
    },
    placeholderData: (prev) => prev, // keep previous data while fetching next page
  });
}

/** Single lead by ID */
export function useLead(id: string) {
  return useQuery<Lead>({
    queryKey: ["leads", id],
    queryFn: () => api.get(`/leads/${id}`) as unknown as Promise<Lead>,
    enabled: !!id,
    retry: (count, err: unknown) => {
      // Don't retry on 404 — record doesn't exist
      if ((err as { response?: { status?: number } })?.response?.status === 404) return false;
      return count < 1;
    },
  });
}

// ── Mutation hooks ────────────────────────────────────────────────────────

export function useCreateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => api.post("/leads", body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead created.");
    },
    onError: (err: unknown) => {
      toast.error((err as { message?: string })?.message ?? "Failed to create lead.");
    },
  });
}

export function useUpdateLead(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => api.patch(`/leads/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["leads", id] });
      toast.success("Lead updated.");
    },
    onError: (err: unknown) => {
      toast.error((err as { message?: string })?.message ?? "Failed to update lead.");
    },
  });
}

export function useDeleteLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/leads/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      toast.success("Lead deleted.");
    },
    onError: (err: unknown) => {
      toast.error((err as { message?: string })?.message ?? "Failed to delete lead.");
    },
  });
}

export function useConvertLead(id: string) {
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: () => api.post(`/leads/${id}/convert`, {}) as unknown as Promise<ConvertResponse>,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["leads", id] });
      qc.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Lead converted to customer!");
      router.push(`/customers/${(data as unknown as ConvertResponse).customerId}`);
    },
    onError: (err: unknown) => {
      const typedErr = err as { errorData?: { code?: string }; message?: string };
      if (typedErr?.errorData?.code === "ALREADY_CONVERTED" ||
          (err as { response?: { status?: number } })?.response?.status === 409) {
        toast.error("This lead has already been converted to a customer.");
      } else {
        toast.error(typedErr?.message ?? "Failed to convert lead.");
      }
    },
  });
}
