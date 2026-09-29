"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api-client";
import { useAuthStore } from "@/store/auth.store";

/**
 * PrefetchProvider — fire a batch of low-cost prefetches right after login
 * so navigating to the most-visited list pages renders INSTANTLY from cache.
 *
 * Cache keys use the EXACT SAME SHAPE that each list page's initial render
 * passes to useQuery. This is CRITICAL: if the keys don't match, the
 * prefetch populates a DIFFERENT cache slot than the page actually reads →
 * user sees skeleton spinner anyway, prefetch wasted.
 *
 * Reference contract: `LIST_DEFAULTS` in useListParams.ts.
 *   page=1, limit=20, sort="-createdAt" for most lists
 *   page=1, limit=20, sort="-quotationDate" for quotations
 */
const PREFETCH_KEY = "erp-prefetched";

export default function PrefetchProvider({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user) return;

    const done = sessionStorage.getItem(PREFETCH_KEY);
    if (done) return;

    // Query keys mirror LIST_DEFAULTS — every key includes page/limit/sort
    // so the first list-page render hits the SAME cache entry.
    const prefetches = [
      // Leads
      qc.prefetchQuery({
        queryKey: ["leads", { page: 1, limit: 20, sort: "-createdAt" }],
        queryFn:  () => api.get("/leads", { params: { page: 1, limit: 20, sort: "-createdAt" } }),
      }),
      // Customers
      qc.prefetchQuery({
        queryKey: ["customers", { page: 1, limit: 20, sort: "-createdAt" }],
        queryFn:  () => api.get("/customers", { params: { page: 1, limit: 20, sort: "-createdAt" } }),
      }),
      // Quotations (default sort = quotationDate desc)
      qc.prefetchQuery({
        queryKey: ["quotations", { page: 1, limit: 20, sort: "-quotationDate" }],
        queryFn:  () => api.get("/quotations", { params: { page: 1, limit: 20, sort: "-quotationDate" } }),
      }),
      // Products page (catalog first tab after login typically)
      qc.prefetchQuery({
        queryKey: ["products", { page: 1, limit: 20, sort: "-createdAt" }],
        queryFn:  () => api.get("/products", { params: { page: 1, limit: 20, sort: "-createdAt" } }),
      }),
      // Catalog metadata — small lists, loaded everywhere for dropdown filters
      qc.prefetchQuery({
        queryKey: ["services", { page: 1, limit: 20, sort: "-createdAt" }],
        queryFn:  () => api.get("/services", { params: { page: 1, limit: 20, sort: "-createdAt" } }),
      }),
      qc.prefetchQuery({
        queryKey: ["categories", { page: 1, limit: 20, sort: "-createdAt" }],
        queryFn:  () => api.get("/categories", { params: { page: 1, limit: 20, sort: "-createdAt" } }),
      }),
    ];

    Promise.allSettled(prefetches).then(() => {
      sessionStorage.setItem(PREFETCH_KEY, "true");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return <>{children}</>;
}
