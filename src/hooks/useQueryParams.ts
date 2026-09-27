"use client";

import { useRouter, useSearchParams } from "next/navigation";

/**
 * useQueryParams — read and write URL search params.
 *
 * Usage:
 *   const { params, setParam, setParams, resetParams } = useQueryParams();
 *   params.page        // current ?page value (string)
 *   setParam('page', '2')  // updates URL, React Query refetches via queryKey
 *   setParams({ status: 'NEW', page: '1' })
 *   resetParams()          // clears all params
 */
export function useQueryParams<T extends Record<string, string>>() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // All current URL params as a typed object
  const params = Object.fromEntries(searchParams.entries()) as T;

  /** Set or delete a single param. Empty string → delete. */
  const setParam = (key: string, value: string) => {
    const current = new URLSearchParams(searchParams.toString());
    if (value) {
      current.set(key, value);
    } else {
      current.delete(key);
    }
    // Scroll to top is handled by Next.js router by default
    router.push(`?${current.toString()}`);
  };

  /** Set multiple params at once. Resets page to 1 unless explicitly provided. */
  const setParams = (updates: Partial<Record<string, string>>) => {
    const current = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        current.set(key, value);
      } else {
        current.delete(key);
      }
    });
    // Reset to page 1 when filters change (unless page is explicitly in updates)
    if (!("page" in updates)) {
      current.set("page", "1");
    }
    router.push(`?${current.toString()}`);
  };

  /** Clear all params (resets search, filters, pagination). */
  const resetParams = () => {
    router.push("?");
  };

  return { params, setParam, setParams, resetParams };
}
