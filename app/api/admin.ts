import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { APIError, api } from '@/api/eden-treaty';
import type { UserRole } from '~/schemas/users';

// =============================================================================
// API FUNCTIONS (invitations)
// =============================================================================

async function inviteUser(input: { email: string }) {
  const { data, error } = await api.admin.invitations.post(input);
  if (error) {
    throw new APIError(error);
  }
  return data;
}

// =============================================================================
// QUERY KEYS
// =============================================================================

export const adminQueryKeys = {
  users: ['admin', 'users'] as const,
};

// =============================================================================
// API FUNCTIONS
// =============================================================================

async function getUsers() {
  const { data, error } = await api.admin.users.get();
  if (error) throw new APIError(error);
  return data;
}

async function changeUserRole(params: { userId: string; role: UserRole }) {
  const { data, error } = await api.admin.users({ id: params.userId }).role.put({
    role: params.role,
  });
  if (error) throw new APIError(error);
  return data;
}

async function deleteUser(userId: string) {
  const { data, error } = await api.admin.users({ id: userId }).delete();
  if (error) throw new APIError(error);
  return data;
}

async function revokeUserSessions(userId: string) {
  const { data, error } = await api.admin.users({ id: userId }).sessions.delete();
  if (error) throw new APIError(error);
  return data;
}

// =============================================================================
// QUERIES
// =============================================================================

export function useAdminUsers() {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: adminQueryKeys.users,
    queryFn: getUsers,
    staleTime: 30 * 1000, // 30 seconds
  });

  return {
    users: data ?? [],
    isLoading,
    isFetching,
    error,
    refetch,
  };
}

// =============================================================================
// MUTATIONS
// =============================================================================

export function useChangeUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changeUserRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.users });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.users });
    },
  });
}

export function useRevokeUserSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revokeUserSessions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.users });
    },
  });
}

export function useInviteUser(options?: { onSuccess?: () => void }) {
  return useMutation({
    mutationFn: inviteUser,
    onSuccess: options?.onSuccess,
  });
}
