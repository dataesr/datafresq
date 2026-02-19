import { Elysia } from 'elysia';
import { config } from '~/config';
import { AppError, RateLimitError } from '~/errors';

function logError(code: string | number, error: unknown, requestId?: string) {
  const message = error instanceof Error ? error.message : String(error);
  const errorCode = error instanceof AppError ? error.code : code;
  const rid = requestId ? requestId.slice(0, 8) : '--------';

  if (config.isProduction) {
    console.error(
      `[${new Date().toLocaleTimeString('fr-FR')}] ${rid} ERROR ${errorCode} ${message}`,
    );
  } else {
    console.error(`[ERROR ${code}]:`, error);
  }
}

const STATUS_MAP: Record<string, number> = {
  // 400 Bad Request
  BAD_REQUEST: 400,
  INVALID_TOKEN: 400,
  TOKEN_MISSING: 400,
  PASSWORD_MISMATCH: 400,

  // 401 Unauthorized
  UNAUTHORIZED: 401,
  INVALID_CREDENTIALS: 401,
  INVALID_SESSION: 401,
  SESSION_REUSE: 401,

  // 403 Forbidden
  FORBIDDEN: 403,
  ACCOUNT_INACTIVE: 403,

  // 404 Not Found
  NOT_FOUND: 404,
  USER_NOT_FOUND: 404,
  SESSION_NOT_FOUND: 404,

  // 409 Conflict
  EMAIL_ALREADY_EXISTS: 409,

  // 429 Rate Limited
  RATE_LIMIT_EXCEEDED: 429,

  // 500 Internal Server Error
  DATABASE_ERROR: 500,
  INTERNAL_SERVER_ERROR: 500,
  JWT_FAILED: 500,
  MAILER_FAILED: 500,
};

export const errorHandler = new Elysia({ name: 'error-handler' })
  .onError(({ code, error, set, ...ctx }) => {
    const requestId = 'requestId' in ctx ? (ctx.requestId as string) : undefined;
    logError(code, error, requestId);

    if (error instanceof AppError) {
      set.status = STATUS_MAP[error.code] ?? 500;

      if (error instanceof RateLimitError) {
        set.headers['Retry-After'] = error.retryAfter.toString();
      }

      return {
        code: error.code,
        message: error.message,
        ...(!config.isProduction && error.details ? { details: error.details } : {}),
      };
    }

    switch (code) {
      case 'VALIDATION': {
        set.status = 422;
        let details: Record<string, unknown> | undefined;
        if (!config.isProduction) {
          try {
            details = JSON.parse(error.message);
          } catch {
            details = { raw: error.message };
          }
        }
        return {
          code: 'VALIDATION_ERROR',
          message: 'Les données envoyées sont invalides',
          ...(details ? { details } : {}),
        };
      }

      case 'NOT_FOUND':
        set.status = 404;
        return {
          code: 'NOT_FOUND',
          message: 'La ressource demandée est introuvable',
        };

      case 'PARSE':
        set.status = 400;
        return {
          code: 'PARSE_ERROR',
          message: 'Format de requête invalide. Impossible de lire le corps de la requête.',
          ...(!config.isProduction ? { details: { message: error?.message } } : {}),
        };

      case 'INVALID_COOKIE_SIGNATURE':
        set.status = 401;
        return {
          code: 'INVALID_SESSION',
          message: 'Session invalide. Veuillez vous reconnecter.',
        };

      case 'INVALID_FILE_TYPE':
        set.status = 422;
        return {
          code: 'INVALID_FILE_TYPE',
          message: 'Type de fichier invalide. Veuillez envoyer un fichier valide.',
          ...(!config.isProduction ? { details: { message: error?.message } } : {}),
        };

      case 'INTERNAL_SERVER_ERROR':
      case 'UNKNOWN':
        set.status = 500;
        return {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Une erreur interne du serveur est survenue',
          ...(!config.isProduction
            ? { details: { message: error?.message, stack: error?.stack } }
            : {}),
        };

      default:
        set.status = 500;
        return {
          code: 'UNHANDLED_ERROR',
          message: 'Une erreur non gérée est survenue',
        };
    }
  })
  .as('scoped');
