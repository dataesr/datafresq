import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { APIError } from '@/api/eden-treaty';

// =============================================================================
// QUERY CLIENT
// =============================================================================

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('[QueryCache] Error:', error);
      }
    },
  }),

  mutationCache: new MutationCache({
    onError: (error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('[MutationCache] Error:', error);
      }
    },
  }),

  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof APIError && error.isClientError()) return false;
        return failureCount < 2;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
    },
    mutations: {
      retry: false,
    },
  },
});
