import { Elysia } from 'elysia';
import { config } from '~/config';
import { AppError } from '~/errors/base.error';

export const errorHandler = new Elysia({ name: 'error-handler' }).onError(
  ({ code, error, set }) => {
    if (!config.isProduction) {
      console.error(`[ERROR ${code}]:`, error);
    }

    if (error instanceof AppError) {
      set.status = error.status;
      return {
        code: error.code,
        message: error.message,
        ...(!config.isProduction && error.details ? { details: error.details } : {}),
      };
    }

    switch (code) {
      case 'VALIDATION':
        set.status = 422;
        return error.detail(error.message);

      case 'NOT_FOUND':
        set.status = 404;
        return {
          code: 'NOT_FOUND',
          message: 'The requested resource was not found',
        };

      case 'PARSE':
        set.status = 400;
        return {
          code: 'PARSE_ERROR',
          message: 'Invalid request format. Unable to parse request body.',
          ...(!config.isProduction ? { details: { message: error?.message } } : {}),
        };

      case 'INVALID_COOKIE_SIGNATURE':
        set.status = 401;
        return {
          code: 'INVALID_SESSION',
          message: 'Invalid session. Please log in again.',
        };

      case 'INVALID_FILE_TYPE':
        set.status = 422;
        return {
          code: 'INVALID_FILE_TYPE',
          message: 'Invalid file type. Please upload a valid file.',
          ...(!config.isProduction ? { details: { message: error?.message } } : {}),
        };

      case 'INTERNAL_SERVER_ERROR':
      case 'UNKNOWN':
        set.status = 500;
        return {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An internal server error occurred',
          ...(!config.isProduction
            ? { details: { message: error?.message, stack: error?.stack } }
            : {}),
        };

      default:
        set.status = 500;
        return {
          code: 'UNHANDLED_ERROR',
          message: 'An unhandled error occurred',
        };
    }
  },
);
