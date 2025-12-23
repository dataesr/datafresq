import { useMutation, useQueryClient } from '@tanstack/react-query';
import { APIError, api } from '@/api/eden-treaty';
import { queryKeys } from './users';

// =============================================================================
// API FUNCTIONS
// =============================================================================

async function signIn(input: { email: string; password: string }) {
  const { error } = await api.auth.signin.post(input);
  if (error) {
    throw new APIError(error);
  }
}

async function signOut() {
  const { error } = await api.auth.signout.post();
  if (error) throw new APIError(error);
}

async function refreshSession() {
  const { error } = await api.auth.session.refresh.post();
  if (error) throw new APIError(error);
}

async function forgotPassword(input: { email: string }) {
  const { error } = await api.auth['mot-de-passe-oublie'].post(input);
  if (error) throw new APIError(error);
}

async function resetPassword(input: { token: string; password: string }) {
  const { error } = await api.auth['reinitialiser-mot-de-passe'].post(input);
  if (error) {
    throw new APIError(error);
  }
}

// =============================================================================
// MUTATIONS
// =============================================================================

export function useSignIn(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.me });
      options?.onSuccess?.();
    },
  });
}

export function useSignOut(options?: { redirectTo?: string }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      queryClient.clear();
      window.location.href = options?.redirectTo ?? '/auth/se-connecter';
    },
  });
}

export function useRefreshSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: refreshSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.me });
    },
  });
}

export function useForgotPassword(options?: { onSuccess?: () => void }) {
  return useMutation({
    mutationFn: forgotPassword,
    onSuccess: options?.onSuccess,
  });
}

export function useResetPassword(options?: { onSuccess?: () => void }) {
  return useMutation({
    mutationFn: resetPassword,
    onSuccess: options?.onSuccess,
  });
}
