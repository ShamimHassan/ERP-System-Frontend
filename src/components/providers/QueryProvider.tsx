"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime:          5 * 60_000,  // 5 min — don't re-fetch if data is fresh
            gcTime:            10 * 60_000,  // 10 min — keep in cache after component unmounts
            retry:              1,
            refetchOnWindowFocus: false,     // no surprise re-fetch on tab switch
            refetchOnReconnect: false,       // no re-fetch on network reconnect
          },
        },
      })
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
