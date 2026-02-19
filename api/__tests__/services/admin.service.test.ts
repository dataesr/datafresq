import { beforeEach, describe, expect, it } from 'bun:test';
import { mockCollections, resetAllMocks, setupMockDb } from '../helpers/mock-db';

setupMockDb();

import { DatabaseError, NotFoundError } from '~/errors';
import {
  deactivateUser,
  listAllUsers,
  revokeUserSessions,
  updateUserRole,
} from '~/services/admin.service';

const NOW = new Date();

const USER_DOC = {
  id: 'user-1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'user' as const,
  isActive: true,
  lastLogin: null,
  lastPasswordChange: null,
  createdAt: NOW,
  updatedAt: NOW,
};

const ADMIN_DOC = {
  ...USER_DOC,
  id: 'admin-1',
  email: 'admin@example.com',
  role: 'admin' as const,
};

describe('admin.service', () => {
  beforeEach(() => resetAllMocks());

  describe('listAllUsers', () => {
    it('returns all users with admin projection', async () => {
      const users = [USER_DOC, ADMIN_DOC];
      mockCollections.users.find.mockReturnValue({ toArray: () => Promise.resolve(users) });

      const result = await listAllUsers();

      expect(mockCollections.users.find).toHaveBeenCalledTimes(1);
      expect(result as unknown).toEqual(users);
      expect(result).toHaveLength(2);
    });

    it('returns empty array when no users exist', async () => {
      mockCollections.users.find.mockReturnValue({ toArray: () => Promise.resolve([]) });

      const result = await listAllUsers();

      expect(result).toEqual([]);
    });

    it('passes projection as second argument to find', async () => {
      mockCollections.users.find.mockReturnValue({ toArray: () => Promise.resolve([]) });

      await listAllUsers();

      const [filter, options] = mockCollections.users.find.mock.calls[0]!;
      expect(filter).toEqual({});
      expect(options).toHaveProperty('projection');
    });
  });

  describe('updateUserRole', () => {
    it('updates the user role when user exists', async () => {
      mockCollections.users.findOne.mockResolvedValue(USER_DOC);
      mockCollections.users.updateOne.mockResolvedValue({ acknowledged: true, modifiedCount: 1 });

      await updateUserRole('user-1', 'admin');

      expect(mockCollections.users.findOne).toHaveBeenCalledWith({ id: 'user-1' });
      expect(mockCollections.users.updateOne).toHaveBeenCalledTimes(1);

      const [filter, update] = mockCollections.users.updateOne.mock.calls[0]!;
      expect(filter).toEqual({ id: 'user-1' });
      expect(update.$set.role).toBe('admin');
      expect(update.$set).toHaveProperty('updatedAt');
      expect(update.$set.updatedAt).toBeInstanceOf(Date);
    });

    it('throws NotFoundError when user does not exist', async () => {
      mockCollections.users.findOne.mockResolvedValue(null);

      expect(updateUserRole('nonexistent', 'admin')).rejects.toBeInstanceOf(NotFoundError);
    });

    it('throws DatabaseError when update is not acknowledged', async () => {
      mockCollections.users.findOne.mockResolvedValue(USER_DOC);
      mockCollections.users.updateOne.mockResolvedValue({ acknowledged: false, modifiedCount: 0 });

      expect(updateUserRole('user-1', 'admin')).rejects.toBeInstanceOf(DatabaseError);
    });

    it('throws DatabaseError when modifiedCount is 0', async () => {
      mockCollections.users.findOne.mockResolvedValue(USER_DOC);
      mockCollections.users.updateOne.mockResolvedValue({ acknowledged: true, modifiedCount: 0 });

      expect(updateUserRole('user-1', 'admin')).rejects.toBeInstanceOf(DatabaseError);
    });

    it('can change role from admin to user', async () => {
      mockCollections.users.findOne.mockResolvedValue(ADMIN_DOC);
      mockCollections.users.updateOne.mockResolvedValue({ acknowledged: true, modifiedCount: 1 });

      await updateUserRole('admin-1', 'user');

      const [filter, update] = mockCollections.users.updateOne.mock.calls[0]!;
      expect(filter).toEqual({ id: 'admin-1' });
      expect(update.$set.role).toBe('user');
    });
  });

  describe('deactivateUser', () => {
    it('sets isActive to false and deletes all user sessions', async () => {
      mockCollections.users.findOne.mockResolvedValue(USER_DOC);
      mockCollections.users.updateOne.mockResolvedValue({ acknowledged: true, modifiedCount: 1 });
      mockCollections.sessions.deleteMany.mockResolvedValue({ deletedCount: 3 });

      await deactivateUser('user-1');

      expect(mockCollections.users.findOne).toHaveBeenCalledWith({ id: 'user-1' });

      const [filter, update] = mockCollections.users.updateOne.mock.calls[0]!;
      expect(filter).toEqual({ id: 'user-1' });
      expect(update.$set.isActive).toBe(false);
      expect(update.$set).toHaveProperty('updatedAt');

      expect(mockCollections.sessions.deleteMany).toHaveBeenCalledWith({ userId: 'user-1' });
    });

    it('throws NotFoundError when user does not exist', async () => {
      mockCollections.users.findOne.mockResolvedValue(null);

      expect(deactivateUser('nonexistent')).rejects.toBeInstanceOf(NotFoundError);
      expect(mockCollections.users.updateOne).not.toHaveBeenCalled();
      expect(mockCollections.sessions.deleteMany).not.toHaveBeenCalled();
    });

    it('throws DatabaseError when update is not acknowledged', async () => {
      mockCollections.users.findOne.mockResolvedValue(USER_DOC);
      mockCollections.users.updateOne.mockResolvedValue({ acknowledged: false, modifiedCount: 0 });

      expect(deactivateUser('user-1')).rejects.toBeInstanceOf(DatabaseError);
    });

    it('throws DatabaseError when modifiedCount is 0', async () => {
      mockCollections.users.findOne.mockResolvedValue(USER_DOC);
      mockCollections.users.updateOne.mockResolvedValue({ acknowledged: true, modifiedCount: 0 });

      expect(deactivateUser('user-1')).rejects.toBeInstanceOf(DatabaseError);
    });

    it('still deletes sessions even when user has no active sessions', async () => {
      mockCollections.users.findOne.mockResolvedValue(USER_DOC);
      mockCollections.users.updateOne.mockResolvedValue({ acknowledged: true, modifiedCount: 1 });
      mockCollections.sessions.deleteMany.mockResolvedValue({ deletedCount: 0 });

      await deactivateUser('user-1');

      expect(mockCollections.sessions.deleteMany).toHaveBeenCalledWith({ userId: 'user-1' });
    });
  });

  describe('revokeUserSessions', () => {
    it('deletes all sessions for the user and returns count', async () => {
      mockCollections.users.findOne.mockResolvedValue(USER_DOC);
      mockCollections.sessions.deleteMany.mockResolvedValue({ deletedCount: 5 });

      const result = await revokeUserSessions('user-1');

      expect(mockCollections.users.findOne).toHaveBeenCalledWith({ id: 'user-1' });
      expect(mockCollections.sessions.deleteMany).toHaveBeenCalledWith({ userId: 'user-1' });
      expect(result).toBe(5);
    });

    it('returns 0 when user has no sessions', async () => {
      mockCollections.users.findOne.mockResolvedValue(USER_DOC);
      mockCollections.sessions.deleteMany.mockResolvedValue({ deletedCount: 0 });

      const result = await revokeUserSessions('user-1');

      expect(result).toBe(0);
    });

    it('throws NotFoundError when user does not exist', async () => {
      mockCollections.users.findOne.mockResolvedValue(null);

      expect(revokeUserSessions('nonexistent')).rejects.toBeInstanceOf(NotFoundError);
      expect(mockCollections.sessions.deleteMany).not.toHaveBeenCalled();
    });
  });
});
