"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/api-client";
import type { CatalogService, Category, Product, ProductPrice, PriceHistory, PaginationMeta } from "@/types/api.types";

type ListResponse<T> = { data: T[]; meta: PaginationMeta };

// ── Generic list helper ────────────────────────────────────────────────────
function mkList<T>(key: string, endpoint: string) {
  return (params: Record<string, unknown> = {}) =>
    useQuery<ListResponse<T>>({
      queryKey: [key, params],
      queryFn: async () => {
        const res = await api.get(endpoint, { params }) as unknown;
        if (Array.isArray(res)) return { data: res as T[], meta: { page: 1, limit: 100, total: (res as T[]).length, totalPages: 1 } };
        return res as ListResponse<T>;
      },
      placeholderData: (prev) => prev,
    });
}

// ── Services ──────────────────────────────────────────────────────────────
export const useServices = mkList<CatalogService>("services", "/services");

export function useCreateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => api.post("/services", body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["services"] }); toast.success("Service created."); },
    onError: (err: unknown) => toast.error((err as { message?: string })?.message ?? "Failed to create service."),
  });
}

export function useUpdateService(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => api.patch(`/services/${id}`, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["services"] }); toast.success("Service updated."); },
    onError: (err: unknown) => toast.error((err as { message?: string })?.message ?? "Failed to update service."),
  });
}

export function useDeleteService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/services/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["services"] }); toast.success("Service deleted."); },
    onError: (err: unknown) => toast.error((err as { message?: string })?.message ?? "Failed to delete service."),
  });
}

// ── Categories ────────────────────────────────────────────────────────────
export const useCategories = mkList<Category>("categories", "/categories");

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => api.post("/categories", body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["categories"] }); toast.success("Category created."); },
    onError: (err: unknown) => {
      const msg = (err as { message?: string; errorData?: { code?: string } })?.message;
      if ((err as { errorData?: { code?: string } })?.errorData?.code === "CONFLICT") toast.error(msg ?? "Category already exists.");
      else toast.error(msg ?? "Failed to create category.");
    },
  });
}

export function useUpdateCategory(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => api.patch(`/categories/${id}`, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["categories"] }); toast.success("Category updated."); },
    onError: (err: unknown) => toast.error((err as { message?: string })?.message ?? "Failed to update category."),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["categories"] }); toast.success("Category deleted."); },
    onError: (err: unknown) => toast.error((err as { message?: string })?.message ?? "Failed to delete category."),
  });
}

// ── Products ──────────────────────────────────────────────────────────────
export const useProducts = mkList<Product>("products", "/products");

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => api.post("/products", body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["products"] }); toast.success("Product created."); },
    onError: (err: unknown) => toast.error((err as { message?: string })?.message ?? "Failed to create product."),
  });
}

export function useUpdateProduct(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => api.patch(`/products/${id}`, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["products"] }); toast.success("Product updated."); },
    onError: (err: unknown) => toast.error((err as { message?: string })?.message ?? "Failed to update product."),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["products"] }); toast.success("Product deleted."); },
    onError: (err: unknown) => toast.error((err as { message?: string })?.message ?? "Cannot delete: product has active prices or order items."),
  });
}

// ── Prices ────────────────────────────────────────────────────────────────
export function usePrices(productId: string, params: Record<string, unknown> = {}) {
  return useQuery<ListResponse<ProductPrice> & { meta: PaginationMeta & { currentPriceId?: string | null } }>({
    queryKey: ["prices", productId, params],
    queryFn: () => api.get(`/products/${productId}/prices`, { params }) as unknown as Promise<ListResponse<ProductPrice> & { meta: PaginationMeta & { currentPriceId?: string | null } }>,
    enabled: !!productId,
  });
}

export function useCurrentPrice(productId: string) {
  return useQuery<ProductPrice>({
    queryKey: ["prices", productId, "current"],
    queryFn: () => api.get(`/products/${productId}/prices/current`) as unknown as Promise<ProductPrice>,
    enabled: !!productId,
    retry: (count, err: unknown) => {
      if ((err as { response?: { status?: number } })?.response?.status === 404) return false;
      return count < 1;
    },
  });
}

export function useAddPrice(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => api.post(`/products/${productId}/prices`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["prices", productId] });
      toast.success("New price set.");
    },
    onError: (err: unknown) => toast.error((err as { message?: string })?.message ?? "Failed to set price."),
  });
}

export function usePriceHistory(productId: string) {
  return useQuery<ListResponse<PriceHistory>>({
    queryKey: ["price-history", productId],
    queryFn: () => api.get(`/products/${productId}/prices/history`) as unknown as Promise<ListResponse<PriceHistory>>,
    enabled: !!productId,
  });
}
