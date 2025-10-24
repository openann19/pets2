'use client';
import React, { Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from '../../contexts/AuthContext';
import { SocketProvider } from '../../contexts/SocketContext';
// Create a client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
            retry: 2,
            refetchOnWindowFocus: false,
        },
    },
});
export default function AppProviders({ children }) {
    return (<QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
              <div className="text-lg">Loading...</div>
            </div>}>
            {children}
          </Suspense>
        </SocketProvider>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false}/>
    </QueryClientProvider>);
}
//# sourceMappingURL=AppProviders.jsx.map