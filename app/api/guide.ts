import { useMutation } from '@tanstack/react-query';
import { APIError, api } from '@/api/eden-treaty';
import type { GuideReviewBody } from '~/schemas/guide';

// =============================================================================
// API FUNCTIONS
// =============================================================================

async function submitReview(input: GuideReviewBody) {
  const { data, error } = await api.guide.reviews.post(input);
  if (error) throw new APIError(error);
  return data;
}

// =============================================================================
// HOOKS
// =============================================================================

export function useSubmitGuideReview(options?: { onSuccess?: () => void }) {
  return useMutation({
    mutationFn: submitReview,
    onSuccess: options?.onSuccess,
  });
}
