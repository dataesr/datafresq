import { Elysia } from 'elysia';
import { AppError } from '~/errors/base.error';

export const errorHandler = new Elysia({ name: 'error-handler' }).onError(
  ({ code, error, set }) => {
    // Dev mode logging
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[ERROR ${code}]:`, error);
    }

    if (error instanceof AppError) {
      set.status = error.status;
      const response = error.toResponse();
      return response.json();
    }

    switch (code) {
      case 'VALIDATION':
        set.status = 422;
        return error.detail(error.message);

      case 'NOT_FOUND':
        set.status = 404;
        return {
          message: 'The requested resource was not found',
          code: 'NOT_FOUND',
        };

      case 'PARSE':
        set.status = 400;
        return {
          message: 'Invalid request format. Unable to parse request body.',
          code: 'PARSE_ERROR',
          details: process.env.NODE_ENV !== 'production' ? error?.message : undefined,
        };

      case 'INVALID_COOKIE_SIGNATURE':
        set.status = 401;
        return {
          message: 'Invalid session. Please log in again.',
          code: 'INVALID_SESSION',
        };

      case 'INVALID_FILE_TYPE':
        set.status = 422;
        return {
          message: 'Invalid file type. Please upload a valid file.',
          code: 'INVALID_FILE_TYPE',
          details: error?.message,
        };

      case 'INTERNAL_SERVER_ERROR':
        set.status = 500;
        return {
          message: 'An internal server error occurred',
          code: 'INTERNAL_SERVER_ERROR',
          details:
            process.env.NODE_ENV !== 'production'
              ? { message: error?.message, stack: error?.stack }
              : undefined,
        };

      case 'UNKNOWN':
        set.status = 500;
        return {
          message: 'An internal server error occurred',
          code: 'INTERNAL_SERVER_ERROR',
          details:
            process.env.NODE_ENV !== 'production'
              ? { message: error?.message, stack: error?.stack }
              : undefined,
        };
      default:
        set.status = error.code;
        return {
          message: 'An unhandled error occurred',
          code: 'UNHANDLED_ERROR',
        };
    }
  },
);
