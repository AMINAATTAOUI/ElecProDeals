import { ReactNode } from 'react';
import { onlineManager, QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { storage } from '@/lib/mmkvStorage';

interface QueryProviderProps {
  children: ReactNode;
}

export const QueryProvider = ({ children }: QueryProviderProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
