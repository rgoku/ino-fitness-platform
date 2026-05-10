'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,      // 5 min — don't refetch if data is fresh
        gcTime: 30 * 60 * 1000,          // 30 min — keep in cache
        refetchOnWindowFocus: false,     // don't refetch on tab switch
        retry: 1,                        // only retry once
        refetchOnReconnect: 'always',    // refetch when back online
      },
    },
  }));

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
