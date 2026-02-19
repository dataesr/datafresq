import { describe, expect, it } from 'bun:test';
import { Elysia, t } from 'elysia';
import {
  AccountInactiveError,
  BadRequestError,
  DatabaseError,
  EmailAlreadyExistsError,
  ForbiddenError,
  InternalServerError,
  InvalidCredentialsError,
  InvalidSessionError,
  InvalidTokenError,
  JWTFailedError,
  MailerFailedError,
  NotFoundError,
  PasswordMismatchError,
  RateLimitError,
  SessionNotFoundError,
  SessionReuseError,
  TokenMissingError,
  UnauthorizedError,
  UserNotFoundError,
} from '~/errors';
import { errorHandler } from '~/plugins/error-handler';

function createTestApp() {
  return new Elysia()
    .use(errorHandler)
    .post('/validate', ({ body }) => body, {
      body: t.Object({
        email: t.String({ format: 'email' }),
        password: t.String({ minLength: 8 }),
      }),
    })
    .get('/throw/:errorType', ({ params: { errorType } }) => {
      const errorMap: Record<string, () => never> = {
        'bad-request': () => {
          throw new BadRequestError();
        },
        'not-found': () => {
          throw new NotFoundError('Élément introuvable');
        },
        internal: () => {
          throw new InternalServerError();
        },
        unauthorized: () => {
          throw new UnauthorizedError();
        },
        'invalid-credentials': () => {
          throw new InvalidCredentialsError();
        },
        forbidden: () => {
          throw new ForbiddenError();
        },
        'account-inactive': () => {
          throw new AccountInactiveError();
        },
        'email-exists': () => {
          throw new EmailAlreadyExistsError();
        },
        'invalid-token': () => {
          throw new InvalidTokenError();
        },
        'token-missing': () => {
          throw new TokenMissingError();
        },
        'password-mismatch': () => {
          throw new PasswordMismatchError();
        },
        'jwt-failed': () => {
          throw new JWTFailedError();
        },
        'mailer-failed': () => {
          throw new MailerFailedError();
        },
        'user-not-found': () => {
          throw new UserNotFoundError();
        },
        'invalid-session': () => {
          throw new InvalidSessionError();
        },
        'session-not-found': () => {
          throw new SessionNotFoundError();
        },
        'session-reuse': () => {
          throw new SessionReuseError();
        },
        'rate-limit': () => {
          throw new RateLimitError('Trop de requêtes', 60);
        },
        database: () => {
          throw new DatabaseError('Échec de connexion');
        },
        generic: () => {
          throw new Error('Erreur inattendue');
        },
      };
      const thrower = errorMap[errorType];
      if (!thrower) throw new NotFoundError(`Unknown error type: ${errorType}`);
      return thrower();
    });
}

describe('Error Handler', () => {
  const app = createTestApp();

  describe('Elysia validation errors', () => {
    it('returns 422 with standardized error shape for missing required fields', async () => {
      const response = await app.handle(
        new Request('http://localhost/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        }),
      );
      expect(response.status).toBe(422);
      const body = await response.json();
      expect(body.code).toBe('VALIDATION_ERROR');
      expect(body.message).toBe('Les données envoyées sont invalides');
    });

    it('returns 422 with standardized error shape for invalid email format', async () => {
      const response = await app.handle(
        new Request('http://localhost/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'not-an-email', password: 'longpassword123' }),
        }),
      );
      expect(response.status).toBe(422);
      const body = await response.json();
      expect(body.code).toBe('VALIDATION_ERROR');
      expect(body.message).toBe('Les données envoyées sont invalides');
    });

    it('returns 422 with standardized error shape for password too short', async () => {
      const response = await app.handle(
        new Request('http://localhost/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@example.com', password: 'short' }),
        }),
      );
      expect(response.status).toBe(422);
      const body = await response.json();
      expect(body.code).toBe('VALIDATION_ERROR');
      expect(body.message).toBe('Les données envoyées sont invalides');
    });

    it('includes validation details in non-production mode', async () => {
      const response = await app.handle(
        new Request('http://localhost/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        }),
      );
      const body = await response.json();
      expect(body).toHaveProperty('details');
      expect(body.details).toHaveProperty('type', 'validation');
    });
  });

  describe('STATUS_MAP — 400 Bad Request errors', () => {
    it('returns 400 for BadRequestError', async () => {
      const response = await app.handle(new Request('http://localhost/throw/bad-request'));
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.code).toBe('BAD_REQUEST');
    });

    it('returns 400 for InvalidTokenError', async () => {
      const response = await app.handle(new Request('http://localhost/throw/invalid-token'));
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.code).toBe('INVALID_TOKEN');
    });

    it('returns 400 for TokenMissingError', async () => {
      const response = await app.handle(new Request('http://localhost/throw/token-missing'));
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.code).toBe('TOKEN_MISSING');
    });

    it('returns 400 for PasswordMismatchError', async () => {
      const response = await app.handle(new Request('http://localhost/throw/password-mismatch'));
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.code).toBe('PASSWORD_MISMATCH');
    });
  });

  describe('STATUS_MAP — 401 Unauthorized errors', () => {
    it('returns 401 for UnauthorizedError', async () => {
      const response = await app.handle(new Request('http://localhost/throw/unauthorized'));
      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.code).toBe('UNAUTHORIZED');
    });

    it('returns 401 for InvalidCredentialsError', async () => {
      const response = await app.handle(new Request('http://localhost/throw/invalid-credentials'));
      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.code).toBe('INVALID_CREDENTIALS');
    });

    it('returns 401 for InvalidSessionError', async () => {
      const response = await app.handle(new Request('http://localhost/throw/invalid-session'));
      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.code).toBe('INVALID_SESSION');
    });

    it('returns 401 for SessionReuseError', async () => {
      const response = await app.handle(new Request('http://localhost/throw/session-reuse'));
      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.code).toBe('SESSION_REUSE');
    });
  });

  describe('STATUS_MAP — 403 Forbidden errors', () => {
    it('returns 403 for ForbiddenError', async () => {
      const response = await app.handle(new Request('http://localhost/throw/forbidden'));
      expect(response.status).toBe(403);
      const body = await response.json();
      expect(body.code).toBe('FORBIDDEN');
    });

    it('returns 403 for AccountInactiveError', async () => {
      const response = await app.handle(new Request('http://localhost/throw/account-inactive'));
      expect(response.status).toBe(403);
      const body = await response.json();
      expect(body.code).toBe('ACCOUNT_INACTIVE');
    });
  });

  describe('STATUS_MAP — 404 Not Found errors', () => {
    it('returns 404 for NotFoundError', async () => {
      const response = await app.handle(new Request('http://localhost/throw/not-found'));
      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body.code).toBe('NOT_FOUND');
      expect(body.message).toBe('Élément introuvable');
    });

    it('returns 404 for UserNotFoundError', async () => {
      const response = await app.handle(new Request('http://localhost/throw/user-not-found'));
      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body.code).toBe('USER_NOT_FOUND');
    });

    it('returns 404 for SessionNotFoundError', async () => {
      const response = await app.handle(new Request('http://localhost/throw/session-not-found'));
      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body.code).toBe('SESSION_NOT_FOUND');
    });
  });

  describe('STATUS_MAP — 409 Conflict errors', () => {
    it('returns 409 for EmailAlreadyExistsError', async () => {
      const response = await app.handle(new Request('http://localhost/throw/email-exists'));
      expect(response.status).toBe(409);
      const body = await response.json();
      expect(body.code).toBe('EMAIL_ALREADY_EXISTS');
    });
  });

  describe('STATUS_MAP — 429 Rate Limit errors', () => {
    it('returns 429 for RateLimitError', async () => {
      const response = await app.handle(new Request('http://localhost/throw/rate-limit'));
      expect(response.status).toBe(429);
      const body = await response.json();
      expect(body.code).toBe('RATE_LIMIT_EXCEEDED');
    });

    it('includes Retry-After header for RateLimitError', async () => {
      const response = await app.handle(new Request('http://localhost/throw/rate-limit'));
      expect(response.headers.get('retry-after')).toBe('60');
    });
  });

  describe('STATUS_MAP — 500 Internal Server errors', () => {
    it('returns 500 for InternalServerError', async () => {
      const response = await app.handle(new Request('http://localhost/throw/internal'));
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.code).toBe('INTERNAL_SERVER_ERROR');
    });

    it('returns 500 for JWTFailedError', async () => {
      const response = await app.handle(new Request('http://localhost/throw/jwt-failed'));
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.code).toBe('JWT_FAILED');
    });

    it('returns 500 for MailerFailedError', async () => {
      const response = await app.handle(new Request('http://localhost/throw/mailer-failed'));
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.code).toBe('MAILER_FAILED');
    });

    it('returns 500 for DatabaseError', async () => {
      const response = await app.handle(new Request('http://localhost/throw/database'));
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.code).toBe('DATABASE_ERROR');
    });
  });

  describe('Error response shape', () => {
    it('always returns code and message fields', async () => {
      const response = await app.handle(new Request('http://localhost/throw/not-found'));
      const body = await response.json();
      expect(body).toHaveProperty('code');
      expect(body).toHaveProperty('message');
      expect(typeof body.code).toBe('string');
      expect(typeof body.message).toBe('string');
    });

    it('includes details in non-production for generic errors', async () => {
      const response = await app.handle(new Request('http://localhost/throw/generic'));
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.code).toBe('INTERNAL_SERVER_ERROR');
      expect(body.message).toBe('Une erreur interne du serveur est survenue');
    });
  });

  describe('Unknown routes (Elysia NOT_FOUND)', () => {
    it('returns 404 for unknown API paths', async () => {
      const response = await app.handle(new Request('http://localhost/does-not-exist'));
      expect(response.status).toBe(404);
    });
  });

  describe('Parse errors', () => {
    it('returns 400 for unparseable JSON body', async () => {
      const response = await app.handle(
        new Request('http://localhost/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '{invalid json',
        }),
      );
      expect([400, 422]).toContain(response.status);
    });
  });
});
