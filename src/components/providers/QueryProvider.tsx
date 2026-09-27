"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

/**
 * QueryProvider — wraps the app with TanStack Query's QueryClientProvider.
 *
 * Uses useState to create the QueryClient once per component lifetime.
 * This is the correct Next.js App Router pattern: avoids sharing state
 * across requests on the server and prevents stale data between renders.
 */
export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,        // 30s before data considered stale
            retry: 1,                  // retry failed requests once
            refetchOnWindowFocus: false, // don't refetch on tab switch
          },
        },
      })
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
