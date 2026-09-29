"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api-client";
import { useAuthStore } from "@/store/auth.store";

/**
 * PrefetchProvider — after login, prefetch the most-visited endpoints
 * so navigation feels instant. Runs once per session.
 */
const PREFETCH_KEY = "erp-prefetched";

export default function PrefetchProvider({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user) return;

    const done = sessionStorage.getItem(PREFETCH_KEY);
    if (done) return;

    // Fire-and-forget prefetch of the most common list endpoints
    // These populate the TanStack Query cache so navigating to those
    // pages feels instant (data already there, skeleton shows 0-100ms).
    const prefetches = [
      qc.prefetchQuery({
        queryKey: ["leads",     { page: 1, limit: 20, sort: "-createdAt" }],
        queryFn:  () => api.get("/leads",     { params: { page: 1, limit: 20, sort: "-createdAt" } }),
      }),
      qc.prefetchQuery({
        queryKey: ["customers", { page: 1, limit: 20, sort: "-createdAt" }],
        queryFn:  () => api.get("/customers", { params: { page: 1, limit: 20, sort: "-createdAt" } }),
      }),
      qc.prefetchQuery({
        queryKey: ["quotations", { page: 1, limit: 20, sort: "-quotationDate" }],
        queryFn:  () => api.get("/quotations", { params: { page: 1, limit: 20, sort: "-quotationDate" } }),
      }),
      qc.prefetchQuery({
        queryKey: ["services-list"],
        queryFn:  () => api.get("/services", { params: { limit: 100 } }),
      }),
    ];

    Promise.allSettled(prefetches).then(() => {
      sessionStorage.setItem(PREFETCH_KEY, "true");
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return <>{children}</>;
}
