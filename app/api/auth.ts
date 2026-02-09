import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { APIError, api } from '@/api/eden-treaty';
import { queryClient } from '@/api/query-client';
import { hasAuthCookie } from '@/utils/hasAuthCookie';

// =============================================================================
// QUERY KEYS
// =============================================================================

export const authKeys = {
  user: ['auth', 'user'] as const,
};

// =============================================================================
// API FUNCTIONS
// =============================================================================

async function checkAuth() {
  if (!hasAuthCookie()) return null;

  const refreshResult = await api.auth.session.refresh.post();

  if (refreshResult.error) {
    // Refresh failed - session is invalid, clear all cached data
    queryClient.clear();
    return null;
  }

  const { data, error } = await api.me.get();

  if (error) {
    if (error.status === 401) {
      // Unexpected 401 after refresh - clear cache
      queryClient.clear();
      return null;
    }
    throw new APIError(error);
  }

  return data;
}

// =============================================================================
// AUTH HOOKS
// =============================================================================

export function useAuth() {
  const { data: user, isLoading } = useSuspenseQuery({
    queryKey: authKeys.user,
    queryFn: checkAuth,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchInterval: 13 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: false,
  });

  return {
    user: user ?? null,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };
}

// =============================================================================
// AUTH MUTATIONS
// =============================================================================

export function useSignIn(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { email: string; password: string }) => {
      const { error } = await api.auth.signin.post(input);
      if (error) throw new APIError(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.user });
      options?.onSuccess?.();
    },
  });
}

export function useSignOut(options?: { redirectTo?: string }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await api.auth.signout.post();
      if (error) throw new APIError(error);
    },
    onSettled: () => {
      queryClient.clear();
      window.location.href = options?.redirectTo ?? '/auth/se-connecter';
    },
  });
}

export function useForgotPassword(options?: { onSuccess?: () => void }) {
  return useMutation({
    mutationFn: async (input: { email: string }) => {
      const { error } = await api.auth['mot-de-passe-oublie'].post(input);
      if (error) throw new APIError(error);
    },
    onSuccess: options?.onSuccess,
  });
}

export function useResetPassword(options?: { onSuccess?: () => void }) {
  return useMutation({
    mutationFn: async (input: { token: string; password: string }) => {
      const { error } = await api.auth['reinitialiser-mot-de-passe'].post(input);
      if (error) throw new APIError(error);
    },
    onSuccess: options?.onSuccess,
  });
}
