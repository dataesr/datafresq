import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { APIError, api } from '@/api/eden-treaty';
import type { ChangePassword, UpdateUser } from '~/schemas/users';

// =============================================================================
// QUERY KEYS
// =============================================================================

export const queryKeys = {
  me: ['me'] as const,
  sessions: {
    list: ['sessions'] as const,
  },
};

// =============================================================================
// API FUNCTIONS
// =============================================================================

async function getMe() {
  const { data, error } = await api.me.get();
  if (error) throw new APIError(error);
  return data;
}

async function updateProfile(input: UpdateUser) {
  const { data, error } = await api.me.patch(input);
  if (error) throw new APIError(error);
  return data;
}

async function changePassword(input: ChangePassword) {
  const { data, error } = await api.me['change-password'].post(input);
  if (error) throw new APIError(error);
  return { success: true, message: data.message };
}

async function getSessions() {
  const { data, error } = await api.sessions.get();
  if (error) throw new APIError(error);
  return data.sessions;
}

async function revokeSession(sessionId: string) {
  const { data, error } = await api.sessions({ id: sessionId }).delete();
  if (error) throw new APIError(error);
  return { success: true, message: data.message };
}

async function revokeAllSessions() {
  const { data, error } = await api.sessions.delete();
  if (error) throw new APIError(error);
  return { success: true, message: data.message };
}

// =============================================================================
// QUERY HOOKS
// =============================================================================

export function useCurrentUser() {
  const queryClient = useQueryClient();

  const { data: user } = useSuspenseQuery({
    queryKey: queryKeys.me,
    queryFn: getMe,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.me });
  };

  return {
    user,
    isAdmin: user?.role === 'admin',
    invalidate,
  };
}

export function useOptionalCurrentUser() {
  const {
    data: user,
    isLoading,
    error,
    isError,
    fetchStatus,
  } = useQuery({
    queryKey: queryKeys.me,
    queryFn: getMe,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    throwOnError: false,
  });

  const isAuthError = isError && error instanceof APIError && error.is(401);
  const isActuallyLoading = isLoading && fetchStatus === 'fetching' && !isError;
  const exposedError = isError && !isAuthError ? error : null;

  return {
    user: user ?? null,
    isLoading: isActuallyLoading,
    isAuthenticated: !!user,
    error: exposedError,
  };
}

export function useSessions() {
  return useSuspenseQuery({
    queryKey: queryKeys.sessions.list,
    queryFn: getSessions,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// =============================================================================
// MUTATION HOOKS
// =============================================================================

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(queryKeys.me, updatedUser);
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: changePassword,
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revokeSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.list });
    },
  });
}

export function useRevokeAllSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revokeAllSessions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sessions.list });
      queryClient.invalidateQueries({ queryKey: queryKeys.me });
    },
  });
}
