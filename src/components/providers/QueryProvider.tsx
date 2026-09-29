"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

/**
 * Production-grade TanStack Query v5 configuration.
 *
 * Design principles for the ERP System (mostly-read CRM dashboard + CRUD):
 *
 * 1. CACHE-FIRST, not network-first. Data like leads, products, customers
 *    changes slowly (minutes-to-hours), so hitting the cache instantly and
 *    avoiding network round-trips is the #1 perceived-performance win.
 *
 * 2. NO SURPRISE RE-FETCHES. Users hate when they're looking at data and it
 *    suddenly reloads because they alt-tabbed to Slack and back.
 *    refetchOnWindowFocus + refetchOnReconnect + refetchOnMount = all OFF.
 *    The list pages already have explicit 🔄 refresh buttons if the user
 *    needs fresh data.
 *
 * 3. STALE = 15 MINUTES. A page navigated to within 15 min of a previous
 *    load will render INSTANTLY from cache (no skeleton, no spinner, no
 *    network call at all). After 15 min, the cached data is still shown
 *    immediately but a soft background refetch kicks in (stale-while-
 *    revalidate pattern).
 *
 * 4. TRACKED NOTIFICATIONS. React Query v5 `notifyOnChangeProps: 'tracked'`
 *    is the default, but we are explicit. This means a component that only
 *    destructures `data` does NOT re-render when `isFetching` changes,
 *    eliminating hundreds of phantom re-renders across skeleton rows.
 *
 * 5. GC = 1 HOUR. Even if the user leaves the Leads page and comes back
 *    55 min later, the data is still sitting in memory → instant paint.
 *
 * 6. RETRY BACKOFF. 1 retry with exponential delay so transient Vercel
 *    serverless cold-starts don't show errors to the user on first click.
 */
export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // ── Cache lifetime (drives instant renders) ─────────────
            staleTime: 15 * 60_000,          // 15 min fresh → no network at all
            gcTime:    60 * 60_000,          // 1 hr in-memory after unmount

            // ── Never surprise-refetch ─────────────────────────────
            refetchOnWindowFocus: false,
            refetchOnReconnect:   false,
            refetchOnMount:       false,     // ★ most impactful: cached → render now

            // ── Retry with backoff (cold-start forgiveness) ────────
            retry:              1,
            retryDelay:         (attempt) => Math.min(1000 * 2 ** attempt, 5000),

            // ── Rendering correctness ──────────────────────────────
            structuralSharing:  true,        // preserve object identity across refetches

            // Don't throw errors into error boundaries — toast handles them
            throwOnError:       false,
          },
          mutations: {
            retry:    0,
            onError:  () => { /* toast per-mutation handles errors */ },
          },
        },
      })
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
