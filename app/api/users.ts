import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { APIError, api } from '@/api/eden-treaty';
import type { ChangePassword, UpdateUser } from '~/schemas/users';

// =============================================================================
// QUERY KEYS
// =============================================================================

export const userKeys = {
  sessions: ['user', 'sessions'] as const,
};

// =============================================================================
// API FUNCTIONS
// =============================================================================

async function getSessions() {
  const { data, error } = await api.sessions.get();
  if (error) throw new APIError(error);
  return data.sessions;
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

export function useSessions() {
  return useSuspenseQuery({
    queryKey: userKeys.sessions,
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
      queryClient.setQueryData(['auth', 'user'], updatedUser);
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
      queryClient.invalidateQueries({ queryKey: userKeys.sessions });
    },
  });
}

export function useRevokeAllSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revokeAllSessions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.sessions });
      queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
    },
  });
}
