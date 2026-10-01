"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api-client";
import type { Order, PaginationMeta } from "@/types/api.types";

interface OrdersResponse { data: Order[]; meta: PaginationMeta; }

export function useOrders(params: Record<string, unknown>) {
  return useQuery<OrdersResponse>({
    queryKey: ["orders", params],
    queryFn: async () => {
      const res = await api.get("/sales-orders", { params }) as unknown;
      if (res && typeof res === "object" && "data" in (res as object) && "meta" in (res as object)) return res as OrdersResponse;
      if (Array.isArray(res)) return { data: res as Order[], meta: { page: 1, limit: 20, total: (res as Order[]).length, totalPages: 1 } };
      return res as OrdersResponse;
    },
    placeholderData: (prev) => prev,
  });
}

export function useOrder(id: string) {
  return useQuery<Order>({
    queryKey: ["orders", id],
    queryFn: () => api.get(`/sales-orders/${id}`) as unknown as Promise<Order>,
    enabled: !!id,
    retry: (count, err: unknown) => {
      if ((err as { response?: { status?: number } })?.response?.status === 404) return false;
      return count < 1;
    },
  });
}

export function useUpdateOrderStatus(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: string) => api.patch(`/sales-orders/${id}`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["orders", id] });
      toast.success("Order status updated.");
    },
    onError: (err: unknown) => toast.error((err as { message?: string })?.message ?? "Failed to update status."),
  });
}

export function useCancelOrder(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post(`/sales-orders/${id}/cancel`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["orders", id] });
      toast.success("Order cancelled.");
    },
    onError: (err: unknown) => toast.error((err as { message?: string })?.message ?? "Failed to cancel order."),
  });
}
