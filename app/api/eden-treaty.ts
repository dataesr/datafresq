import { treaty } from '@elysiajs/eden';

import type { App } from '~/index';

export const api = treaty<App>(window.location.origin).api;

type TErrorValue = {
  message?: string;
  code?: string;
  summary?: string;
  type?: string;
  on?: string;
  found?: unknown;
  property?: string;
  expected?: string;
  error?: {
    message?: string;
    code?: string;
  };
};

function extractMessage(obj: unknown): string | undefined {
  if (!obj || typeof obj !== 'object') return undefined;

  // Check for value.error.message (most common from Elysia)
  if ('error' in obj) {
    const inner = obj.error;
    if (typeof inner === 'string') return inner;
    if (inner && typeof inner === 'object' && 'message' in inner) {
      if (typeof inner.message === 'string') return inner.message;
    }
  }

  // Check for direct message property
  if ('message' in obj && typeof obj.message === 'string') {
    return obj.message;
  }

  // Check for summary
  if ('summary' in obj && typeof obj.summary === 'string') {
    return obj.summary;
  }

  // Check for type
  if ('type' in obj && typeof obj.type === 'string') {
    return obj.type;
  }

  return undefined;
}

export class APIError extends Error {
  public readonly status: number;
  public readonly value: TErrorValue;

  constructor(error: { status?: number; value?: TErrorValue } | unknown) {
    let status = 0;
    let value: TErrorValue = {};
    let extractedMessage: string | undefined;

    if (error && typeof error === 'object') {
      if ('status' in error && typeof error.status === 'number') {
        status = error.status;
      }

      if ('value' in error) {
        const errorValue = error.value;
        if (errorValue && typeof errorValue === 'object') {
          value = errorValue as TErrorValue;
          // Extract message from value (handles value.error.message)
          extractedMessage = extractMessage(errorValue);
        } else if (typeof errorValue === 'string') {
          value = { message: errorValue };
          extractedMessage = errorValue;
        }
      }

      // Fallback: try to extract from the error object itself
      if (!extractedMessage) {
        extractedMessage = extractMessage(error);
      }
    }

    const message =
      extractedMessage ||
      (status === 401
        ? 'Non autorisé'
        : status === 403
          ? 'Accès refusé'
          : status === 404
            ? 'Ressource introuvable'
            : status >= 500
              ? 'Erreur serveur'
              : status > 0
                ? `Erreur ${status}`
                : 'Une erreur est survenue');

    super(message);

    this.name = 'APIError';
    this.status = status;
    this.value = value;

    if (Error.captureStackTrace) Error.captureStackTrace(this, APIError);
  }

  is(status: number): boolean {
    return this.status === status;
  }

  isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  isServerError(): boolean {
    return this.status >= 500;
  }

  isValidationError(): boolean {
    return (
      this.status === 422 ||
      this.value?.code === 'VALIDATION_ERROR' ||
      this.value?.type === 'validation'
    );
  }

  getCode(): string | undefined {
    return this.value?.code || this.value?.error?.code;
  }
}
