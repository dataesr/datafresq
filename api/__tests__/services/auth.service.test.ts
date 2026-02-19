import { beforeEach, describe, expect, it } from 'bun:test';
import {
  mockCollections,
  mockPassword,
  realHashToken,
  resetAllMocks,
  setupMockDb,
  setupMockEmail,
  setupMockId,
  setupMockPassword,
  setupMockToken,
} from '../helpers/mock-db';

setupMockDb();
setupMockEmail();
setupMockPassword();
setupMockToken();
setupMockId();

import { AccountInactiveError, InvalidCredentialsError, NotFoundError } from '~/errors';
import { changePassword, signin, signout } from '~/services/auth.service';

const CLIENT_INFO = { userAgent: 'test-agent', ipAddress: '127.0.0.1' };

const ACTIVE_USER = {
  id: 'user-1',
  email: 'test@example.com',
  passwordHash: 'hashed_correct_password',
  firstName: 'Test',
  lastName: 'User',
  role: 'user' as const,
  isActive: true,
  lastLogin: null,
  lastPasswordChange: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('auth.service', () => {
  beforeEach(() => resetAllMocks());

  describe('signin', () => {
    it('throws InvalidCredentialsError when user is not found', async () => {
      mockCollections.users.findOne.mockResolvedValue(null);

      expect(signin('unknown@example.com', 'password', CLIENT_INFO)).rejects.toBeInstanceOf(
        InvalidCredentialsError,
      );
    });

    it('throws AccountInactiveError when user is inactive', async () => {
      mockCollections.users.findOne.mockResolvedValue({ ...ACTIVE_USER, isActive: false });

      expect(signin('test@example.com', 'password', CLIENT_INFO)).rejects.toBeInstanceOf(
        AccountInactiveError,
      );
    });

    it('throws InvalidCredentialsError when user has no password hash', async () => {
      mockCollections.users.findOne.mockResolvedValue({ ...ACTIVE_USER, passwordHash: undefined });

      expect(signin('test@example.com', 'password', CLIENT_INFO)).rejects.toBeInstanceOf(
        InvalidCredentialsError,
      );
    });

    it('throws InvalidCredentialsError when password is wrong', async () => {
      mockCollections.users.findOne.mockResolvedValue(ACTIVE_USER);
      mockPassword.verifyPassword.mockResolvedValue(false);

      expect(signin('test@example.com', 'wrong-password', CLIENT_INFO)).rejects.toBeInstanceOf(
        InvalidCredentialsError,
      );
    });

    it('returns accessTokenPayload and sessionToken on success', async () => {
      mockCollections.users.findOne.mockResolvedValue(ACTIVE_USER);
      mockPassword.verifyPassword.mockResolvedValue(true);
      mockCollections.sessions.insertOne.mockResolvedValue({ insertedId: 'session-id' });
      mockCollections.users.updateOne.mockResolvedValue({ acknowledged: true });

      const result = await signin('test@example.com', 'correct-password', CLIENT_INFO);

      expect(result).toHaveProperty('accessTokenPayload');
      expect(result).toHaveProperty('sessionToken');
      expect(result.accessTokenPayload).toEqual({
        sub: 'user-1',
        email: 'test@example.com',
        role: 'user',
      });
      expect(typeof result.sessionToken).toBe('string');
      expect(result.sessionToken.length).toBeGreaterThan(0);
    });

    it('creates a session document on success', async () => {
      mockCollections.users.findOne.mockResolvedValue(ACTIVE_USER);
      mockPassword.verifyPassword.mockResolvedValue(true);
      mockCollections.sessions.insertOne.mockResolvedValue({ insertedId: 'session-id' });
      mockCollections.users.updateOne.mockResolvedValue({ acknowledged: true });

      await signin('test@example.com', 'correct-password', CLIENT_INFO);

      expect(mockCollections.sessions.insertOne).toHaveBeenCalledTimes(1);
      const sessionArg = mockCollections.sessions.insertOne.mock.calls[0]![0];
      expect(sessionArg.userId).toBe('user-1');
      expect(sessionArg.userAgent).toBe('test-agent');
      expect(sessionArg.ipAddress).toBe('127.0.0.1');
    });

    it('updates lastLogin on success', async () => {
      mockCollections.users.findOne.mockResolvedValue(ACTIVE_USER);
      mockPassword.verifyPassword.mockResolvedValue(true);
      mockCollections.sessions.insertOne.mockResolvedValue({ insertedId: 'session-id' });
      mockCollections.users.updateOne.mockResolvedValue({ acknowledged: true });

      await signin('test@example.com', 'correct-password', CLIENT_INFO);

      expect(mockCollections.users.updateOne).toHaveBeenCalledTimes(1);
      const [filter, update] = mockCollections.users.updateOne.mock.calls[0]!;
      expect(filter).toEqual({ id: 'user-1' });
      expect(update.$set).toHaveProperty('lastLogin');
      expect(update.$set.lastLogin).toBeInstanceOf(Date);
    });
  });

  describe('signout', () => {
    it('deletes the session when a token is provided', async () => {
      mockCollections.sessions.deleteOne.mockResolvedValue({ deletedCount: 1 });

      await signout('some-session-token');

      expect(mockCollections.sessions.deleteOne).toHaveBeenCalledTimes(1);
      const filter = mockCollections.sessions.deleteOne.mock.calls[0]![0];
      expect(filter).toEqual({ sessionTokenHash: realHashToken('some-session-token') });
    });

    it('does nothing when no token is provided', async () => {
      await signout(undefined);

      expect(mockCollections.sessions.deleteOne).not.toHaveBeenCalled();
    });
  });

  describe('changePassword', () => {
    it('throws NotFoundError when user does not exist', async () => {
      mockCollections.users.findOne.mockResolvedValue(null);

      expect(changePassword('unknown@example.com', 'old', 'new')).rejects.toBeInstanceOf(
        NotFoundError,
      );
    });

    it('throws InvalidCredentialsError when current password is wrong', async () => {
      mockCollections.users.findOne.mockResolvedValue(ACTIVE_USER);
      mockPassword.verifyPassword.mockResolvedValue(false);

      expect(
        changePassword('test@example.com', 'wrong-current', 'new-password'),
      ).rejects.toBeInstanceOf(InvalidCredentialsError);
    });

    it('throws InvalidCredentialsError when user has no password hash', async () => {
      mockCollections.users.findOne.mockResolvedValue({ ...ACTIVE_USER, passwordHash: undefined });

      expect(changePassword('test@example.com', 'anything', 'new-password')).rejects.toBeInstanceOf(
        InvalidCredentialsError,
      );
    });

    it('updates the password hash on success', async () => {
      mockCollections.users.findOne.mockResolvedValue(ACTIVE_USER);
      mockPassword.verifyPassword.mockResolvedValue(true);
      mockCollections.users.updateOne.mockResolvedValue({ acknowledged: true });

      await changePassword('test@example.com', 'correct-current', 'new-password');

      expect(mockCollections.users.updateOne).toHaveBeenCalledTimes(1);
      const [filter, update] = mockCollections.users.updateOne.mock.calls[0]!;
      expect(filter).toEqual({ id: 'user-1' });
      expect(typeof update.$set.passwordHash).toBe('string');
      expect(update.$set.passwordHash.length).toBeGreaterThan(0);
      expect(update.$set).toHaveProperty('lastPasswordChange');
      expect(update.$set).toHaveProperty('updatedAt');
    });
  });
});
