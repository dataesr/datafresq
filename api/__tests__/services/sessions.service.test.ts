import { beforeEach, describe, expect, it } from 'bun:test';
import {
  cursorOf,
  mockCollections,
  mockToken,
  realHashToken,
  resetAllMocks,
  setupMockDb,
  setupMockToken,
} from '../helpers/mock-db';

setupMockDb();
setupMockToken();

import { InvalidSessionError, NotFoundError } from '~/errors';
import {
  getCurrentSession,
  getCurrentSessionForEmail,
  listSessions,
  listSessionsForEmail,
  revokeAllSessions,
  revokeAllSessionsForEmail,
  revokeSession,
  revokeSessionForEmail,
} from '~/services/sessions.service';

const NOW = new Date();
const LATER = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

const TOKEN_ABC_HASH = realHashToken('token-abc');

const SESSION_DOC = {
  id: 'session-1',
  userId: 'user-1',
  sessionTokenHash: TOKEN_ABC_HASH,
  userAgent: 'Mozilla/5.0',
  ipAddress: '192.168.1.1',
  createdAt: NOW,
  lastRefreshedAt: NOW,
  expiresAt: LATER,
};

const USER_DOC = {
  id: 'user-1',
  email: 'test@example.com',
  isActive: true,
};

describe('sessions.service', () => {
  beforeEach(() => resetAllMocks());

  describe('listSessions', () => {
    it('returns projected session fields sorted by lastRefreshedAt', async () => {
      const sessions = [SESSION_DOC, { ...SESSION_DOC, id: 'session-2' }];
      mockCollections.sessions.find.mockReturnValue(cursorOf(sessions));

      const result = await listSessions('user-1');

      expect(mockCollections.sessions.find).toHaveBeenCalledWith({ userId: 'user-1' });
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'session-1',
        userAgent: 'Mozilla/5.0',
        ipAddress: '192.168.1.1',
        createdAt: NOW,
        lastRefreshedAt: NOW,
        expiresAt: LATER,
      });
    });

    it('strips sensitive fields like sessionTokenHash and userId', async () => {
      mockCollections.sessions.find.mockReturnValue(cursorOf([SESSION_DOC]));

      const result = await listSessions('user-1');

      const session = result[0]!;
      expect(session).not.toHaveProperty('sessionTokenHash');
      expect(session).not.toHaveProperty('userId');
    });

    it('returns an empty array when no sessions exist', async () => {
      mockCollections.sessions.find.mockReturnValue(cursorOf([]));

      const result = await listSessions('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('getCurrentSession', () => {
    it('returns session data when found', async () => {
      mockCollections.sessions.findOne.mockResolvedValue(SESSION_DOC);

      const result = await getCurrentSession('user-1', 'token-abc');

      expect(mockToken.hashToken).toHaveBeenCalledWith('token-abc');
      expect(mockCollections.sessions.findOne).toHaveBeenCalledWith({
        sessionTokenHash: TOKEN_ABC_HASH,
        userId: 'user-1',
      });
      expect(result).toEqual({
        id: 'session-1',
        userAgent: 'Mozilla/5.0',
        ipAddress: '192.168.1.1',
        createdAt: NOW,
        lastRefreshedAt: NOW,
        expiresAt: LATER,
      });
    });

    it('throws InvalidSessionError when session is not found', async () => {
      mockCollections.sessions.findOne.mockResolvedValue(null);

      expect(getCurrentSession('user-1', 'invalid-token')).rejects.toBeInstanceOf(
        InvalidSessionError,
      );
    });
  });

  describe('revokeSession', () => {
    it('deletes the session matching id and userId', async () => {
      mockCollections.sessions.deleteOne.mockResolvedValue({ deletedCount: 1 });

      await revokeSession('session-1', 'user-1');

      expect(mockCollections.sessions.deleteOne).toHaveBeenCalledWith({
        id: 'session-1',
        userId: 'user-1',
      });
    });

    it('throws InvalidSessionError when session is not found', async () => {
      mockCollections.sessions.deleteOne.mockResolvedValue({ deletedCount: 0 });

      expect(revokeSession('nonexistent', 'user-1')).rejects.toBeInstanceOf(InvalidSessionError);
    });
  });

  describe('revokeAllSessions', () => {
    it('deletes all sessions for the user and returns count', async () => {
      mockCollections.sessions.deleteMany.mockResolvedValue({ deletedCount: 3 });

      const result = await revokeAllSessions('user-1');

      expect(mockCollections.sessions.deleteMany).toHaveBeenCalledWith({ userId: 'user-1' });
      expect(result).toBe(3);
    });

    it('returns 0 when no sessions exist', async () => {
      mockCollections.sessions.deleteMany.mockResolvedValue({ deletedCount: 0 });

      const result = await revokeAllSessions('user-1');

      expect(result).toBe(0);
    });
  });

  describe('listSessionsForEmail', () => {
    it('resolves user by email then lists sessions', async () => {
      mockCollections.users.findOne.mockResolvedValue(USER_DOC);
      mockCollections.sessions.find.mockReturnValue(cursorOf([SESSION_DOC]));

      const result = await listSessionsForEmail('test@example.com');

      expect(mockCollections.users.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(mockCollections.sessions.find).toHaveBeenCalledWith({ userId: 'user-1' });
      expect(result).toHaveLength(1);
    });

    it('throws NotFoundError when user is not found', async () => {
      mockCollections.users.findOne.mockResolvedValue(null);

      expect(listSessionsForEmail('unknown@example.com')).rejects.toBeInstanceOf(NotFoundError);
    });
  });

  describe('getCurrentSessionForEmail', () => {
    it('resolves user by email then gets current session', async () => {
      mockCollections.users.findOne.mockResolvedValue(USER_DOC);
      mockCollections.sessions.findOne.mockResolvedValue(SESSION_DOC);

      const result = await getCurrentSessionForEmail('test@example.com', 'token-abc');

      expect(mockCollections.users.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(result.id).toBe('session-1');
    });

    it('throws NotFoundError when user is not found', async () => {
      mockCollections.users.findOne.mockResolvedValue(null);

      expect(getCurrentSessionForEmail('unknown@example.com', 'token-abc')).rejects.toBeInstanceOf(
        NotFoundError,
      );
    });
  });

  describe('revokeSessionForEmail', () => {
    it('resolves user by email then revokes the session', async () => {
      mockCollections.users.findOne.mockResolvedValue(USER_DOC);
      mockCollections.sessions.deleteOne.mockResolvedValue({ deletedCount: 1 });

      await revokeSessionForEmail('session-1', 'test@example.com');

      expect(mockCollections.users.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(mockCollections.sessions.deleteOne).toHaveBeenCalledWith({
        id: 'session-1',
        userId: 'user-1',
      });
    });

    it('throws NotFoundError when user is not found', async () => {
      mockCollections.users.findOne.mockResolvedValue(null);

      expect(revokeSessionForEmail('session-1', 'unknown@example.com')).rejects.toBeInstanceOf(
        NotFoundError,
      );
    });

    it('throws InvalidSessionError when session does not belong to user', async () => {
      mockCollections.users.findOne.mockResolvedValue(USER_DOC);
      mockCollections.sessions.deleteOne.mockResolvedValue({ deletedCount: 0 });

      expect(
        revokeSessionForEmail('someone-elses-session', 'test@example.com'),
      ).rejects.toBeInstanceOf(InvalidSessionError);
    });
  });

  describe('revokeAllSessionsForEmail', () => {
    it('resolves user by email then revokes all sessions', async () => {
      mockCollections.users.findOne.mockResolvedValue(USER_DOC);
      mockCollections.sessions.deleteMany.mockResolvedValue({ deletedCount: 5 });

      const result = await revokeAllSessionsForEmail('test@example.com');

      expect(mockCollections.users.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(mockCollections.sessions.deleteMany).toHaveBeenCalledWith({ userId: 'user-1' });
      expect(result).toBe(5);
    });

    it('throws NotFoundError when user is not found', async () => {
      mockCollections.users.findOne.mockResolvedValue(null);

      expect(revokeAllSessionsForEmail('unknown@example.com')).rejects.toBeInstanceOf(
        NotFoundError,
      );
    });
  });
});
