export function getErrorMessage(error: unknown): string {
  if (!error) return 'Une erreur est survenue';

  if (typeof error === 'string') return error;

  if (error instanceof Error) return error.message;

  if (typeof error === 'object') {
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }

    if ('error' in error) {
      const inner = error.error;
      if (typeof inner === 'string') return inner;
      if (inner && typeof inner === 'object' && 'message' in inner) {
        if (typeof inner.message === 'string') return inner.message;
      }
    }

    if ('value' in error && error.value && typeof error.value === 'object') {
      const value = error.value;
      if ('message' in value && typeof value.message === 'string') {
        return value.message;
      }
      if ('error' in value) {
        const inner = value.error;
        if (typeof inner === 'string') return inner;
        if (inner && typeof inner === 'object' && 'message' in inner) {
          if (typeof inner.message === 'string') return inner.message;
        }
      }
    }
  }

  return 'Une erreur est survenue';
}
