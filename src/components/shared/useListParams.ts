"use client";

import { useCallback, useMemo, useState } from "react";

/**
 * Default list-query page size & sort order.
 *
 * THESE VALUES ARE A CONTRACT — they MUST MATCH the defaults used in
 * PrefetchProvider.tsx, the backend applyListQuery(), and each list page's
 * initial render. When they match, the login-time prefetch populates the
 * exact same TanStack Query cache slot, so the FIRST navigation to any
 * list page renders INSTANTLY (0-50 ms, no skeleton).
 */
export const LIST_DEFAULTS = {
  page:  1,
  limit: 20,
  sort:  "-createdAt" as const,
};

/**
 * useListParams — stable-identity pagination/filter state.
 *
 * Without this, objects like `{ page: 1, limit: 20, search: '' }` are
 * created fresh on every render → React Query sees a NEW params object →
 * abandons cache entry → triggers a spurious refetch → flickery skeletons.
 *
 * This hook ensures the params reference only changes when a user action
 * actually changes something (page/limit/search/filter/sort).
 */
export function useListParams<TFilters extends Record<string, unknown> = Record<string, unknown>>(
  initialFilters: TFilters = {} as TFilters,
  overrides: Partial<typeof LIST_DEFAULTS> = {}
) {
  const defaults = { ...LIST_DEFAULTS, ...overrides };
  const [page,  setPage]  = useState(defaults.page);
  const [limit, setLimit] = useState(defaults.limit);
  const [sort,  setSort]  = useState<string>(defaults.sort);
  const [filters, setFilters] = useState<TFilters>(initialFilters);

  const setFilter = useCallback((key: keyof TFilters, value: TFilters[keyof TFilters] | undefined) => {
    setFilters((prev) => {
      if (prev[key] === value) return prev;
      const next = { ...prev };
      if (value === undefined || value === "" || value === null) {
        delete next[key];
      } else {
        next[key] = value;
      }
      return next;
    });
    // Changing a filter resets to page 1
    setPage(1);
  }, []);

  /**
   * The stable params object that goes directly into:
   *   useQuery({ queryKey: ["leads", params], ... })
   * Its reference changes only when a state setter fires.
   */
  const params = useMemo(() => {
    const merged: Record<string, unknown> = { page, limit, sort };
    for (const [k, v] of Object.entries(filters)) {
      if (v !== undefined && v !== "" && v !== null) merged[k] = v;
    }
    return merged as { page: number; limit: number; sort: string } & TFilters;
  }, [page, limit, sort, filters]);

  const gotoPage = useCallback((p: number) => setPage(Math.max(1, p)), []);
  const nextPage = useCallback(() => setPage((p) => p + 1), []);
  const prevPage = useCallback(() => setPage((p) => Math.max(1, p - 1)), []);

  return {
    // state
    page, limit, sort,
    filters,
    // combined params (query key ready)
    params,
    // setters
    setPage: gotoPage,
    nextPage,
    prevPage,
    setLimit: (l: number) => { setLimit(Math.max(1, l)); setPage(1); },
    setSort,
    setFilter,
    resetFilters: () => { setFilters({} as TFilters); setPage(1); },
  };
}
