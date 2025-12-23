import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { APIError, api } from '@/api/eden-treaty';
import { hasAuthCookie } from '@/utils/hasAuthCookie';

// =============================================================================
// SESSION REFRESH LOGIC
// =============================================================================

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  // If already refreshing, wait for that to complete
  if (refreshPromise) return refreshPromise;

  refreshPromise = api.auth.session.refresh
    .post()
    .then(({ error }) => {
      if (error) return false;
      return true;
    })
    .catch(() => false)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function redirectToLogin(): void {
  const currentPath = window.location.pathname + window.location.search;
  const loginUrl = `/auth/se-connecter?redirect=${encodeURIComponent(currentPath)}`;
  window.location.href = loginUrl;
}

function is401Error(error: unknown): boolean {
  if (error instanceof APIError && error.is(401)) {
    return true;
  }
  return false;
}

// =============================================================================
// QUERY CLIENT CONFIGURATION
// =============================================================================

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: async (error, query) => {
      if (!is401Error(error)) return;
      // For session queries, don't try to refresh - let error propagate
      // This prevents infinite loops when the session itself is invalid
      if (query.queryKey[0] === 'me') return;
      if (!hasAuthCookie()) return;

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const refreshed = await refreshSession();
          // If refresh failed, clear cached data and redirect to login
          if (!refreshed) {
            queryClient.clear();
            redirectToLogin();
          }
          await queryClient.invalidateQueries({ queryKey: query.queryKey });
        } finally {
          isRefreshing = false;
        }
      }
    },
  }),

  mutationCache: new MutationCache({
    onError: async (error, _variables, _context) => {
      if (!is401Error(error)) return;
      if (!hasAuthCookie()) return;

      // Attempt to refresh the session
      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const refreshed = await refreshSession();
          // If refresh failed, clear cached data and redirect to login
          if (!refreshed) {
            queryClient.clear();
            redirectToLogin();
          }
          await queryClient.invalidateQueries({ queryKey: ['me'] });
        } finally {
          isRefreshing = false;
        }
      }
    },
  }),

  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry 4xx errors
        if (is401Error(error)) return false;
        if (error instanceof APIError && error.isClientError()) return false;

        // Retry up to 2 times
        return failureCount < 2;
      },

      retryDelay: (attemptIndex) => {
        return Math.min(1000 * 2 ** attemptIndex, 3000);
      },

      staleTime: 15 * 60 * 1000, // 15 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes

      // Refetch behavior
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      placeholderData: (prev: unknown) => prev,
    },

    mutations: {
      retry: false,
    },
  },
});
