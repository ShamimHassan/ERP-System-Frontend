"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/api-client";
import type { Quotation, PaginationMeta } from "@/types/api.types";

interface QuotationsResponse { data: Quotation[]; meta: PaginationMeta; }
interface ConvertResponse { orderId: string; orderNumber: string; }

export function useQuotations(params: Record<string, unknown>) {
  return useQuery<QuotationsResponse>({
    queryKey: ["quotations", params],
    queryFn: async () => {
      const res = await api.get("/quotations", { params }) as unknown;
      if (Array.isArray(res)) return { data: res as Quotation[], meta: { page: 1, limit: 20, total: (res as Quotation[]).length, totalPages: 1 } };
      return res as QuotationsResponse;
    },
    placeholderData: (prev) => prev,
  });
}

export function useQuotation(id: string) {
  return useQuery<Quotation>({
    queryKey: ["quotations", id],
    queryFn: () => api.get(`/quotations/${id}`) as unknown as Promise<Quotation>,
    enabled: !!id,
    retry: (count, err: unknown) => {
      if ((err as { response?: { status?: number } })?.response?.status === 404) return false;
      return count < 1;
    },
  });
}

export function useCreateQuotation() {
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (body: unknown) => api.post("/quotations", body) as unknown as Promise<Quotation>,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["quotations"] });
      toast.success("Quotation created.");
      router.push(`/quotations/${(data as Quotation).id}`);
    },
    onError: (err: unknown) => toast.error((err as { message?: string })?.message ?? "Failed to create quotation."),
  });
}

export function useUpdateQuotation(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => api.patch(`/quotations/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["quotations"] });
      qc.invalidateQueries({ queryKey: ["quotations", id] });
      toast.success("Quotation updated.");
    },
    onError: (err: unknown) => toast.error((err as { message?: string })?.message ?? "Failed to update quotation."),
  });
}

export function useApproveQuotation(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post(`/quotations/${id}/approve`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["quotations", id] });
      toast.success("Quotation approved.");
    },
    onError: (err: unknown) => toast.error((err as { message?: string })?.message ?? "Failed to approve."),
  });
}

export function useRejectQuotation(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { remarks: string }) => api.post(`/quotations/${id}/reject`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["quotations", id] });
      toast.success("Quotation rejected.");
    },
    onError: (err: unknown) => toast.error((err as { message?: string })?.message ?? "Failed to reject."),
  });
}

export function useConvertToOrder(id: string) {
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: () => api.post(`/quotations/${id}/convert-to-order`, {}) as unknown as Promise<ConvertResponse>,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["quotations"] });
      qc.invalidateQueries({ queryKey: ["orders"] });
      toast.success(`Order ${(data as ConvertResponse).orderNumber} created.`);
      router.push(`/orders/${(data as ConvertResponse).orderId}`);
    },
    onError: (err: unknown) => toast.error((err as { message?: string })?.message ?? "Failed to convert."),
  });
}
