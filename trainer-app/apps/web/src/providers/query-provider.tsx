'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,            // 30s — live coaching data shouldn't go stale
        gcTime: 30 * 60 * 1000,          // 30 min — keep in cache
        refetchOnWindowFocus: true,      // refresh when the coach returns to the tab
        retry: 1,                        // only retry once
        refetchOnReconnect: 'always',    // refetch when back online
      },
    },
  }));

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
