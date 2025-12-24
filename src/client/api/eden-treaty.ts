// TODO: Don't know yet how to get rid of 422 response schema so APIError is to be reworked
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
};

export class APIError extends Error {
  public readonly status: number;
  public readonly value: TErrorValue;

  constructor(error: { status?: number; value?: TErrorValue } | unknown) {
    // Handle different error formats from Eden Treaty
    let status = 0;
    let value: TErrorValue = {};

    // Debug log the raw error for troubleshooting
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.debug('[APIError] Constructed:', error);
    }

    if (error && typeof error === 'object') {
      if ('status' in error && typeof error.status === 'number') {
        status = error.status;
      }
      if ('value' in error) {
        const errorValue = error.value;
        if (errorValue && typeof errorValue === 'object') {
          value = errorValue as TErrorValue;
        } else if (typeof errorValue === 'string') {
          value = { message: errorValue };
        }
      }
      // Also check for direct message/error properties (some error formats)
      if (!value.message && 'message' in error && typeof error.message === 'string') {
        value.message = error.message;
      }
      if (!value.message && 'error' in error) {
        const innerError = error.error;
        if (typeof innerError === 'string') {
          value.message = innerError;
        } else if (innerError && typeof innerError === 'object' && 'message' in innerError) {
          value.message = String(innerError.message);
        }
      }
    }

    // Extract message from error value - handle different error formats
    const message =
      value?.message ||
      value?.summary ||
      value?.type ||
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

    // Debug log the constructed error
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.debug('[APIError] Constructed:', { status, message, value });
    }

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) Error.captureStackTrace(this, APIError);
  }

  /**
   * Check if error is a specific status code
   */
  is(status: number): boolean {
    return this.status === status;
  }

  /**
   * Check if error is in a range of status codes
   */
  isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  isServerError(): boolean {
    return this.status >= 500;
  }

  /**
   * Check if this is a validation error
   */
  isValidationError(): boolean {
    return this.status === 422 || this.value?.type === 'validation';
  }

  /**
   * Get the error code if available
   */
  getCode(): string | undefined {
    return this.value?.code;
  }
}
