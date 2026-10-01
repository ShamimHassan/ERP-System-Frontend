"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api-client";
import type { Customer, PaginationMeta } from "@/types/api.types";

interface CustomersResponse {
  data: Customer[];
  meta: PaginationMeta;
}

export function useCustomers(params: Record<string, unknown>) {
  return useQuery<CustomersResponse>({
    queryKey: ["customers", params],
    queryFn: async () => {
      const res = await api.get("/customers", { params }) as unknown;
      // Interceptor returns { data: Customer[], meta } for paginated responses
      if (res && typeof res === "object" && "data" in (res as object) && "meta" in (res as object)) {
        return res as CustomersResponse;
      }
      if (Array.isArray(res)) return { data: res as Customer[], meta: { page: 1, limit: 20, total: (res as Customer[]).length, totalPages: 1 } };
      return res as CustomersResponse;
    },
    placeholderData: (prev) => prev,
  });
}

export function useCustomer(id: string) {
  return useQuery<Customer>({
    queryKey: ["customers", id],
    queryFn: () => api.get(`/customers/${id}`) as unknown as Promise<Customer>,
    enabled: !!id,
    retry: (count, err: unknown) => {
      if ((err as { response?: { status?: number } })?.response?.status === 404) return false;
      return count < 1;
    },
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => api.post("/customers", body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer created.");
    },
    onError: (err: unknown) => {
      toast.error((err as { message?: string })?.message ?? "Failed to create customer.");
    },
  });
}

export function useUpdateCustomer(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => api.patch(`/customers/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      qc.invalidateQueries({ queryKey: ["customers", id] });
      toast.success("Customer updated.");
    },
    onError: (err: unknown) => {
      toast.error((err as { message?: string })?.message ?? "Failed to update customer.");
    },
  });
}
