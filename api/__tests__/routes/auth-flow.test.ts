import { beforeEach, describe, expect, it } from 'bun:test';
import {
  cursorOf,
  mockCollections,
  mockPassword,
  mockToken,
  resetAllMocks,
  setupMockDb,
  setupMockElastic,
  setupMockElasticClient,
  setupMockEmail,
  setupMockEmailTemplates,
  setupMockId,
  setupMockPassword,
  setupMockToken,
} from '../helpers/mock-db';
import { expectError } from '../helpers/treaty';

setupMockEmailTemplates();
setupMockElasticClient();
setupMockDb();
setupMockElastic();
setupMockPassword();
setupMockToken();
setupMockId();
setupMockEmail();

import { treaty } from '@elysiajs/eden';
import { app } from '~/index';
import { authCookieFor } from '../helpers/auth';

const client = treaty(app).api;

const SESSION_EXPIRY = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

const TEST_USER = {
  id: 'user-123',
  email: 'test@example.com',
  passwordHash: 'hashed_correct_password',
  firstName: 'Test',
  lastName: 'User',
  role: 'user' as const,
  isActive: true,
  lastLogin: null,
  lastPasswordChange: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const ADMIN_USER = {
  ...TEST_USER,
  id: 'admin-123',
  email: 'admin@example.com',
  role: 'admin' as const,
};

const TEST_SESSION = {
  id: 'session-123',
  userId: TEST_USER.id,
  sessionTokenHash: 'mock-session-token-hash-abc',
  userAgent: 'test-agent',
  ipAddress: '127.0.0.1',
  createdAt: new Date(),
  lastRefreshedAt: new Date(),
  expiresAt: SESSION_EXPIRY,
};

function fetchOpts(cookie: string) {
  return { fetch: { headers: { cookie } } } as const;
}

function extractCookies(response: Response): string {
  const setCookieHeaders = response.headers.getAll('set-cookie');
  return setCookieHeaders.map((h) => h.split(';')[0]).join('; ');
}

describe('Auth Flow Integration', () => {
  beforeEach(() => {
    resetAllMocks();

    mockPassword.verifyPassword.mockResolvedValue(true);
    mockPassword.hashPassword.mockResolvedValue('hashed_password');
    mockCollections.rateLimits.findOne.mockResolvedValue(null);
    mockCollections.rateLimits.updateOne.mockResolvedValue({ acknowledged: true });
    mockCollections.sessions.insertOne.mockResolvedValue({ insertedId: 'session-mongo-id' });
    mockCollections.users.updateOne.mockResolvedValue({ acknowledged: true, modifiedCount: 1 });
    mockToken.generateSessionInfo.mockReturnValue({
      sessionToken: 'mock-session-token-abc',
      sessionTokenHash: 'mock-session-token-hash-abc',
      expiresAt: SESSION_EXPIRY,
    });
  });

  describe('POST /auth/signin', () => {
    it('returns 200 and sets auth cookies on valid credentials', async () => {
      mockCollections.users.findOne.mockResolvedValue(TEST_USER);

      const { data, status, response } = await client.auth.signin.post({
        email: 'test@example.com',
        password: 'correct-password',
      });

      expect(status).toBe(200);
      expect(data!.success).toBe(true);
      expect(data!.message).toBe('Connexion réussie');

      const cookies = extractCookies(response);
      expect(cookies).toContain('fqv_token=');
      expect(cookies).toContain('fqv_session=');
    });

    it('returns 401 for wrong password', async () => {
      mockCollections.users.findOne.mockResolvedValue(TEST_USER);
      mockPassword.verifyPassword.mockResolvedValue(false);

      const { status, error } = await client.auth.signin.post({
        email: 'test@example.com',
        password: 'wrong-password',
      });

      expect(status).toBe(401);
      expect(expectError(error).code).toBe('INVALID_CREDENTIALS');
    });

    it('returns 401 for non-existent user', async () => {
      mockCollections.users.findOne.mockResolvedValue(null);

      const { status, error } = await client.auth.signin.post({
        email: 'unknown@example.com',
        password: 'any-password',
      });

      expect(status).toBe(401);
      expect(expectError(error).code).toBe('INVALID_CREDENTIALS');
    });

    it('returns 403 for inactive user', async () => {
      mockCollections.users.findOne.mockResolvedValue({ ...TEST_USER, isActive: false });

      const { status, error } = await client.auth.signin.post({
        email: 'test@example.com',
        password: 'correct-password',
      });

      expect(status).toBe(403);
      expect(expectError(error).code).toBe('ACCOUNT_INACTIVE');
    });

    it('returns 422 for missing email', async () => {
      const { status } = await client.auth.signin.post({
        email: undefined as unknown as string,
        password: 'some-password',
      });

      expect(status).toBe(422);
    });

    it('returns 422 for invalid email format', async () => {
      const { status } = await client.auth.signin.post({
        email: 'not-an-email',
        password: 'some-password',
      });

      expect(status).toBe(422);
    });

    it('creates a session document on successful signin', async () => {
      mockCollections.users.findOne.mockResolvedValue(TEST_USER);

      await client.auth.signin.post({
        email: 'test@example.com',
        password: 'correct-password',
      });

      expect(mockCollections.sessions.insertOne).toHaveBeenCalledTimes(1);
      const sessionArg = mockCollections.sessions.insertOne.mock.calls[0]![0];
      expect(sessionArg.userId).toBe('user-123');
    });

    it('updates lastLogin on successful signin', async () => {
      mockCollections.users.findOne.mockResolvedValue(TEST_USER);

      await client.auth.signin.post({
        email: 'test@example.com',
        password: 'correct-password',
      });

      expect(mockCollections.users.updateOne).toHaveBeenCalledTimes(1);
      const [filter, update] = mockCollections.users.updateOne.mock.calls[0]!;
      expect(filter).toEqual({ id: 'user-123' });
      expect(update.$set).toHaveProperty('lastLogin');
      expect(update.$set.lastLogin).toBeInstanceOf(Date);
    });
  });

  describe('Full auth lifecycle', () => {
    it('signin → access /me → signout → /me fails', async () => {
      // Step 1: Signin
      mockCollections.users.findOne.mockResolvedValue(TEST_USER);

      const { status: signinStatus, response: signinResponse } = await client.auth.signin.post({
        email: 'test@example.com',
        password: 'correct-password',
      });

      expect(signinStatus).toBe(200);
      const cookies = extractCookies(signinResponse);

      // Step 2: Access /me
      mockCollections.users.findOne.mockResolvedValue(TEST_USER);

      const { data: meData, status: meStatus } = await client.me.get(fetchOpts(cookies));

      expect(meStatus).toBe(200);
      expect(meData!.email).toBe('test@example.com');

      // Step 3: Signout
      mockCollections.sessions.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const { data: signoutData, status: signoutStatus } = await client.auth.signout.post(
        {},
        fetchOpts(cookies),
      );

      expect(signoutStatus).toBe(200);
      expect(signoutData!.success).toBe(true);

      // Step 4: /me should fail without valid cookies
      const { status: unauthStatus } = await client.me.get();

      expect(unauthStatus).toBe(401);
    });

    it('signin → refresh session → access /me with new token', async () => {
      // Step 1: Signin
      mockCollections.users.findOne.mockResolvedValue(TEST_USER);

      const { status: signinStatus, response: signinResponse } = await client.auth.signin.post({
        email: 'test@example.com',
        password: 'correct-password',
      });

      expect(signinStatus).toBe(200);
      const cookies = extractCookies(signinResponse);

      // Step 2: Refresh session
      mockCollections.sessions.findOne.mockResolvedValue(TEST_SESSION);
      mockCollections.users.findOne.mockResolvedValue(TEST_USER);
      mockCollections.sessions.updateOne.mockResolvedValue({
        acknowledged: true,
        modifiedCount: 1,
      });

      mockToken.generateSessionInfo.mockReturnValue({
        sessionToken: 'refreshed-session-token',
        sessionTokenHash: 'refreshed-session-token-hash',
        expiresAt: SESSION_EXPIRY,
      });

      const {
        data: refreshData,
        status: refreshStatus,
        response: refreshResponse,
      } = await client.auth.session.refresh.post({}, fetchOpts(cookies));

      expect(refreshStatus).toBe(200);
      expect(refreshData!.success).toBe(true);

      const newCookies = extractCookies(refreshResponse);
      expect(newCookies).toContain('fqv_token=');
      expect(newCookies).toContain('fqv_session=');

      // Step 3: Access /me with new cookies
      mockCollections.users.findOne.mockResolvedValue(TEST_USER);

      const { data: meData, status: meStatus } = await client.me.get(fetchOpts(newCookies));

      expect(meStatus).toBe(200);
      expect(meData!.email).toBe('test@example.com');
    });
  });

  describe('POST /auth/session/refresh', () => {
    it('returns 401 when no session cookie is provided', async () => {
      const { status } = await client.auth.session.refresh.post({});

      expect(status).toBe(401);
    });

    it('returns 401 when session token is invalid', async () => {
      mockCollections.sessions.findOne.mockResolvedValue(null);

      const { status } = await client.auth.session.refresh.post(
        {},
        fetchOpts('fqv_token=fake-jwt; fqv_session=invalid-token'),
      );

      expect(status).toBe(401);
    });

    it('returns 401 when session is expired', async () => {
      mockCollections.sessions.findOne.mockResolvedValue({
        ...TEST_SESSION,
        expiresAt: new Date(Date.now() - 1000),
      });

      const { status } = await client.auth.session.refresh.post(
        {},
        fetchOpts('fqv_token=fake-jwt; fqv_session=expired-token'),
      );

      expect(status).toBe(401);
    });

    it('returns 401 when user is inactive', async () => {
      mockCollections.sessions.findOne.mockResolvedValue(TEST_SESSION);
      mockCollections.users.findOne.mockResolvedValue({ ...TEST_USER, isActive: false });
      mockCollections.sessions.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const { status } = await client.auth.session.refresh.post(
        {},
        fetchOpts('fqv_token=fake-jwt; fqv_session=some-token'),
      );

      expect(status).toBe(401);
    });
  });

  describe('POST /auth/signout', () => {
    it('returns 200 and clears cookies', async () => {
      mockCollections.users.findOne.mockResolvedValue(TEST_USER);

      const { response: signinResponse } = await client.auth.signin.post({
        email: 'test@example.com',
        password: 'correct-password',
      });
      const cookies = extractCookies(signinResponse);

      mockCollections.sessions.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const { data, status } = await client.auth.signout.post({}, fetchOpts(cookies));

      expect(status).toBe(200);
      expect(data!.success).toBe(true);
      expect(data!.message).toBe('Déconnexion réussie');
    });

    it('succeeds even without session cookie', async () => {
      const { data, status } = await client.auth.signout.post({});

      expect(status).toBe(200);
      expect(data!.success).toBe(true);
    });
  });

  describe('Protected routes reject unauthenticated requests', () => {
    it('GET /me returns 401 without auth', async () => {
      const { status } = await client.me.get();
      expect(status).toBe(401);
    });

    it('GET /sessions returns 401 without auth', async () => {
      const { status } = await client.sessions.get();
      expect(status).toBe(401);
    });

    it('GET /admin/users returns 401 without auth', async () => {
      const { status } = await client.admin.users.get();
      expect(status).toBe(401);
    });

    it('GET /programs returns 401 without auth', async () => {
      const { status } = await client.programs.get({ query: { q: 'test' } } as never);
      expect(status).toBe(401);
    });
  });

  describe('Admin-only routes require admin role', () => {
    it('regular user gets 403 on admin routes', async () => {
      const cookie = await authCookieFor(TEST_USER);

      const { status } = await client.admin.users.get(fetchOpts(cookie));

      expect(status).toBe(403);
    });

    it('admin user can access admin routes', async () => {
      const cookie = await authCookieFor(ADMIN_USER);

      mockCollections.users.find.mockReturnValue(cursorOf([ADMIN_USER]));

      const { status } = await client.admin.users.get(fetchOpts(cookie));

      expect(status).toBe(200);
    });
  });

  describe('POST /auth/forgot-password', () => {
    it('returns 200 even for non-existent email (no information leak)', async () => {
      mockCollections.users.findOne.mockResolvedValue(null);

      const { data, status } = await client.auth['forgot-password'].post({
        email: 'unknown@example.com',
      });

      expect(status).toBe(200);
      expect(data!.success).toBe(true);
    });

    it('returns 200 and creates token for existing user', async () => {
      mockCollections.users.findOne.mockResolvedValue(TEST_USER);
      mockCollections.tokens.insertOne.mockResolvedValue({ insertedId: 'token-id' });

      const { data, status } = await client.auth['forgot-password'].post({
        email: 'test@example.com',
      });

      expect(status).toBe(200);
      expect(data!.success).toBe(true);

      expect(mockCollections.tokens.insertOne).toHaveBeenCalledTimes(1);
      const tokenArg = mockCollections.tokens.insertOne.mock.calls[0]![0];
      expect(tokenArg.userId).toBe('user-123');
    });

    it('returns 422 for invalid email format', async () => {
      const { status } = await client.auth['forgot-password'].post({
        email: 'not-an-email',
      });

      expect(status).toBe(422);
    });
  });

  describe('POST /auth/reset-password', () => {
    it('returns 200 and resets password with valid token', async () => {
      mockCollections.tokens.findOne.mockResolvedValue({
        id: 'token-1',
        userId: 'user-123',
        type: 'reset-password',
        tokenHash: 'hashed_valid-reset-token',
        used: false,
        expiresAt: new Date(Date.now() + 3600 * 1000),
      });
      mockCollections.users.updateOne.mockResolvedValue({ acknowledged: true, modifiedCount: 1 });
      mockCollections.tokens.updateOne.mockResolvedValue({ acknowledged: true, modifiedCount: 1 });
      mockCollections.sessions.deleteMany.mockResolvedValue({ deletedCount: 2 });

      const { data, status } = await client.auth['reset-password'].post({
        token: 'valid-reset-token',
        password: 'NewSecurePass1',
      });

      expect(status).toBe(200);
      expect(data!.success).toBe(true);

      expect(mockCollections.sessions.deleteMany).toHaveBeenCalledWith({ userId: 'user-123' });
    });

    it('returns 400 for invalid token', async () => {
      mockCollections.tokens.findOne.mockResolvedValue(null);

      const { status, error } = await client.auth['reset-password'].post({
        token: 'bad-token',
        password: 'NewSecurePass1',
      });

      expect(status).toBe(400);
      expect(expectError(error).code).toBe('INVALID_TOKEN');
    });

    it('returns 422 for weak password', async () => {
      const { status } = await client.auth['reset-password'].post({
        token: 'some-token',
        password: 'weak',
      });

      expect(status).toBe(422);
    });
  });

  describe('POST /me/change-password', () => {
    it('returns 200 on successful password change', async () => {
      const cookie = await authCookieFor(TEST_USER);

      mockCollections.users.findOne.mockResolvedValue(TEST_USER);
      mockPassword.verifyPassword.mockResolvedValue(true);
      mockCollections.users.updateOne.mockResolvedValue({ acknowledged: true, modifiedCount: 1 });

      const { data, status } = await client.me['change-password'].post(
        {
          currentPassword: 'correct-password',
          newPassword: 'NewSecurePass1',
        },
        fetchOpts(cookie),
      );

      expect(status).toBe(200);
      expect(data!.success).toBe(true);
    });

    it('returns 401 when current password is wrong', async () => {
      const cookie = await authCookieFor(TEST_USER);

      mockCollections.users.findOne.mockResolvedValue(TEST_USER);
      mockPassword.verifyPassword.mockResolvedValue(false);

      const { status } = await client.me['change-password'].post(
        {
          currentPassword: 'wrong-password',
          newPassword: 'NewSecurePass1',
        },
        fetchOpts(cookie),
      );

      expect(status).toBe(401);
    });

    it('returns 401 without authentication', async () => {
      const { status } = await client.me['change-password'].post({
        currentPassword: 'old',
        newPassword: 'NewSecurePass1',
      });

      expect(status).toBe(401);
    });
  });
});
