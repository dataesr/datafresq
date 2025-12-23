import { useMutation } from '@tanstack/react-query';
import { APIError, api } from '@/api/eden-treaty';
import type { Register } from '~/schemas/auth';

// =============================================================================
// API FUNCTIONS
// =============================================================================

async function inviteUser(input: { email: string }) {
  const { data, error } = await api.invitations.post(input);
  if (error) {
    throw new APIError(error);
  }
  return data;
}

async function register(input: Register) {
  const { data, error } = await api.invitations.register.post(input);
  if (error) {
    throw new APIError(error);
  }
  return data;
}

// =============================================================================
// MUTATIONS
// =============================================================================

export function useInviteUser(options?: { onSuccess?: () => void }) {
  return useMutation({
    mutationFn: inviteUser,
    onSuccess: options?.onSuccess,
  });
}

export function useRegister(options?: { onSuccess?: () => void }) {
  return useMutation({
    mutationFn: register,
    onSuccess: options?.onSuccess,
  });
}
