import { beforeEach, describe, expect, it } from 'bun:test';
import { cursorOf, mockCollections, resetAllMocks, setupMockDb } from '../helpers/mock-db';

setupMockDb();

import { NotFoundError } from '~/errors';
import {
  getMe,
  getUserByEmail,
  getUserById,
  getUserIdByEmail,
  searchUsers,
  updateMe,
} from '~/services/users.service';

const NOW = new Date();

const USER_DOC = {
  id: 'user-1',
  email: 'test@example.com',
  passwordHash: 'hashed_password',
  firstName: 'Jean',
  lastName: 'Dupont',
  role: 'user' as const,
  isActive: true,
  lastLogin: null,
  lastPasswordChange: null,
  createdAt: NOW,
  updatedAt: NOW,
};

// Projected shape returned by MongoDB with USER_SEARCH_PROJECTION.
// TypeScript doesn't track projection effects, so we cast in toEqual assertions.
const USER_PROJECTED = {
  id: 'user-1',
  email: 'test@example.com',
  firstName: 'Jean',
  lastName: 'Dupont',
};

describe('users.service', () => {
  beforeEach(() => resetAllMocks());

  describe('searchUsers', () => {
    it('searches by email, firstName, and lastName with regex', async () => {
      mockCollections.users.find.mockReturnValue(cursorOf([USER_PROJECTED]));

      const result = await searchUsers('jean');

      expect(mockCollections.users.find).toHaveBeenCalledTimes(1);
      const [filter] = mockCollections.users.find.mock.calls[0]!;
      expect(filter.isActive).toBe(true);
      expect(filter.$or).toBeArrayOfSize(3);
      expect(filter.$or[0]).toHaveProperty('email');
      expect(filter.$or[1]).toHaveProperty('firstName');
      expect(filter.$or[2]).toHaveProperty('lastName');
      expect(result as unknown).toEqual([USER_PROJECTED]);
    });

    it('uses case-insensitive regex', async () => {
      mockCollections.users.find.mockReturnValue(cursorOf());

      await searchUsers('Test');

      const [filter] = mockCollections.users.find.mock.calls[0]!;
      expect(filter.$or[0].email.$options).toBe('i');
      expect(filter.$or[1].firstName.$options).toBe('i');
      expect(filter.$or[2].lastName.$options).toBe('i');
    });

    it('escapes special regex characters in query', async () => {
      mockCollections.users.find.mockReturnValue(cursorOf());

      await searchUsers('test+user@example.com');

      const [filter] = mockCollections.users.find.mock.calls[0]!;
      const regex = filter.$or[0].email.$regex;
      expect(regex).toContain('\\+');
      expect(regex).toContain('\\.');
    });

    it('defaults limit to 10', async () => {
      mockCollections.users.find.mockReturnValue(cursorOf());

      await searchUsers('test');

      const [, options] = mockCollections.users.find.mock.calls[0]!;
      expect(options.limit).toBe(10);
    });

    it('accepts a custom limit', async () => {
      mockCollections.users.find.mockReturnValue(cursorOf());

      await searchUsers('test', 5);

      const [, options] = mockCollections.users.find.mock.calls[0]!;
      expect(options.limit).toBe(5);
    });

    it('caps limit to 50', async () => {
      mockCollections.users.find.mockReturnValue(cursorOf());

      await searchUsers('test', 100);

      const [, options] = mockCollections.users.find.mock.calls[0]!;
      expect(options.limit).toBe(50);
    });

    it('returns empty array when no users match', async () => {
      mockCollections.users.find.mockReturnValue(cursorOf());

      const result = await searchUsers('nonexistent');

      expect(result).toEqual([]);
    });

    it('returns multiple matching users', async () => {
      const users = [
        USER_PROJECTED,
        { ...USER_PROJECTED, id: 'user-2', email: 'jean2@example.com' },
      ];
      mockCollections.users.find.mockReturnValue(cursorOf(users));

      const result = await searchUsers('jean');

      expect(result).toHaveLength(2);
    });

    it('passes projection to find', async () => {
      mockCollections.users.find.mockReturnValue(cursorOf());

      await searchUsers('test');

      const [, options] = mockCollections.users.find.mock.calls[0]!;
      expect(options).toHaveProperty('projection');
    });
  });

  describe('getUserById', () => {
    it('returns user when found by id', async () => {
      mockCollections.users.findOne.mockResolvedValue(USER_PROJECTED);

      const result = await getUserById('user-1');

      expect(mockCollections.users.findOne).toHaveBeenCalledTimes(1);
      const [filter] = mockCollections.users.findOne.mock.calls[0]!;
      expect(filter).toEqual({ id: 'user-1', isActive: true });
      expect(result as unknown).toEqual(USER_PROJECTED);
    });

    it('returns null when user is not found', async () => {
      mockCollections.users.findOne.mockResolvedValue(null);

      const result = await getUserById('nonexistent');

      expect(result).toBeNull();
    });

    it('passes search projection', async () => {
      mockCollections.users.findOne.mockResolvedValue(null);

      await getUserById('user-1');

      const [, options] = mockCollections.users.findOne.mock.calls[0]!;
      expect(options).toHaveProperty('projection');
    });

    it('only finds active users', async () => {
      mockCollections.users.findOne.mockResolvedValue(null);

      await getUserById('user-1');

      const [filter] = mockCollections.users.findOne.mock.calls[0]!;
      expect(filter.isActive).toBe(true);
    });
  });

  describe('getUserByEmail', () => {
    it('returns user when found by email', async () => {
      mockCollections.users.findOne.mockResolvedValue(USER_PROJECTED);

      const result = await getUserByEmail('test@example.com');

      expect(mockCollections.users.findOne).toHaveBeenCalledTimes(1);
      const [filter] = mockCollections.users.findOne.mock.calls[0]!;
      expect(filter).toEqual({ email: 'test@example.com' });
      expect(result as unknown).toEqual(USER_PROJECTED);
    });

    it('lowercases the email for lookup', async () => {
      mockCollections.users.findOne.mockResolvedValue(USER_PROJECTED);

      await getUserByEmail('Test@EXAMPLE.COM');

      const [filter] = mockCollections.users.findOne.mock.calls[0]!;
      expect(filter.email).toBe('test@example.com');
    });

    it('returns null when user is not found', async () => {
      mockCollections.users.findOne.mockResolvedValue(null);

      const result = await getUserByEmail('unknown@example.com');

      expect(result).toBeNull();
    });

    it('passes ME projection', async () => {
      mockCollections.users.findOne.mockResolvedValue(null);

      await getUserByEmail('test@example.com');

      const [, options] = mockCollections.users.findOne.mock.calls[0]!;
      expect(options).toHaveProperty('projection');
    });
  });

  describe('getMe', () => {
    it('returns user data when found', async () => {
      mockCollections.users.findOne.mockResolvedValue(USER_PROJECTED);

      const result = await getMe('test@example.com');

      expect(mockCollections.users.findOne).toHaveBeenCalledTimes(1);
      const [filter] = mockCollections.users.findOne.mock.calls[0]!;
      expect(filter).toEqual({ email: 'test@example.com' });
      expect(result as unknown).toEqual(USER_PROJECTED);
    });

    it('throws NotFoundError when user is not found', async () => {
      mockCollections.users.findOne.mockResolvedValue(null);

      expect(getMe('unknown@example.com')).rejects.toBeInstanceOf(NotFoundError);
    });

    it('passes ME projection', async () => {
      mockCollections.users.findOne.mockResolvedValue(USER_PROJECTED);

      await getMe('test@example.com');

      const [, options] = mockCollections.users.findOne.mock.calls[0]!;
      expect(options).toHaveProperty('projection');
    });
  });

  describe('updateMe', () => {
    it('updates firstName and returns the updated user', async () => {
      const updatedUser = { ...USER_PROJECTED, firstName: 'Pierre' };
      mockCollections.users.findOne
        .mockResolvedValueOnce(USER_DOC)
        .mockResolvedValueOnce(updatedUser);
      mockCollections.users.updateOne.mockResolvedValue({ acknowledged: true, modifiedCount: 1 });

      const result = await updateMe('test@example.com', { firstName: 'Pierre' });

      expect(mockCollections.users.updateOne).toHaveBeenCalledTimes(1);
      const [filter, update] = mockCollections.users.updateOne.mock.calls[0]!;
      expect(filter).toEqual({ id: 'user-1' });
      expect(update.$set.firstName).toBe('Pierre');
      expect(update.$set).toHaveProperty('updatedAt');
      expect(result as unknown).toEqual(updatedUser);
    });

    it('updates lastName and returns the updated user', async () => {
      const updatedUser = { ...USER_PROJECTED, lastName: 'Martin' };
      mockCollections.users.findOne
        .mockResolvedValueOnce(USER_DOC)
        .mockResolvedValueOnce(updatedUser);
      mockCollections.users.updateOne.mockResolvedValue({ acknowledged: true, modifiedCount: 1 });

      const result = await updateMe('test@example.com', { lastName: 'Martin' });

      const [, update] = mockCollections.users.updateOne.mock.calls[0]!;
      expect(update.$set.lastName).toBe('Martin');
      expect(update.$set).not.toHaveProperty('firstName');
      expect(result as unknown).toEqual(updatedUser);
    });

    it('updates both firstName and lastName', async () => {
      const updatedUser = { ...USER_PROJECTED, firstName: 'Pierre', lastName: 'Martin' };
      mockCollections.users.findOne
        .mockResolvedValueOnce(USER_DOC)
        .mockResolvedValueOnce(updatedUser);
      mockCollections.users.updateOne.mockResolvedValue({ acknowledged: true, modifiedCount: 1 });

      const result = await updateMe('test@example.com', {
        firstName: 'Pierre',
        lastName: 'Martin',
      });

      const [, update] = mockCollections.users.updateOne.mock.calls[0]!;
      expect(update.$set.firstName).toBe('Pierre');
      expect(update.$set.lastName).toBe('Martin');
      expect(result as unknown).toEqual(updatedUser);
    });

    it('always includes updatedAt in the update', async () => {
      mockCollections.users.findOne
        .mockResolvedValueOnce(USER_DOC)
        .mockResolvedValueOnce(USER_PROJECTED);
      mockCollections.users.updateOne.mockResolvedValue({ acknowledged: true, modifiedCount: 1 });

      await updateMe('test@example.com', {});

      const [, update] = mockCollections.users.updateOne.mock.calls[0]!;
      expect(update.$set).toHaveProperty('updatedAt');
      expect(update.$set.updatedAt).toBeInstanceOf(Date);
    });

    it('throws NotFoundError when user does not exist', async () => {
      mockCollections.users.findOne.mockResolvedValue(null);

      expect(updateMe('unknown@example.com', { firstName: 'Pierre' })).rejects.toBeInstanceOf(
        NotFoundError,
      );
    });

    it('throws NotFoundError when updated user cannot be re-fetched', async () => {
      mockCollections.users.findOne.mockResolvedValueOnce(USER_DOC).mockResolvedValueOnce(null);
      mockCollections.users.updateOne.mockResolvedValue({ acknowledged: true, modifiedCount: 1 });

      expect(updateMe('test@example.com', { firstName: 'Pierre' })).rejects.toBeInstanceOf(
        NotFoundError,
      );
    });

    it('does not set firstName when undefined', async () => {
      mockCollections.users.findOne
        .mockResolvedValueOnce(USER_DOC)
        .mockResolvedValueOnce(USER_PROJECTED);
      mockCollections.users.updateOne.mockResolvedValue({ acknowledged: true, modifiedCount: 1 });

      await updateMe('test@example.com', { lastName: 'Martin' });

      const [, update] = mockCollections.users.updateOne.mock.calls[0]!;
      expect(update.$set).not.toHaveProperty('firstName');
      expect(update.$set.lastName).toBe('Martin');
    });

    it('does not set lastName when undefined', async () => {
      mockCollections.users.findOne
        .mockResolvedValueOnce(USER_DOC)
        .mockResolvedValueOnce(USER_PROJECTED);
      mockCollections.users.updateOne.mockResolvedValue({ acknowledged: true, modifiedCount: 1 });

      await updateMe('test@example.com', { firstName: 'Pierre' });

      const [, update] = mockCollections.users.updateOne.mock.calls[0]!;
      expect(update.$set.firstName).toBe('Pierre');
      expect(update.$set).not.toHaveProperty('lastName');
    });
  });

  describe('getUserIdByEmail', () => {
    it('returns user id when found', async () => {
      mockCollections.users.findOne.mockResolvedValue(USER_DOC);

      const result = await getUserIdByEmail('test@example.com');

      expect(mockCollections.users.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(result).toBe('user-1');
    });

    it('throws NotFoundError when user does not exist', async () => {
      mockCollections.users.findOne.mockResolvedValue(null);

      expect(getUserIdByEmail('unknown@example.com')).rejects.toBeInstanceOf(NotFoundError);
    });

    it('returns the id field of the found user', async () => {
      const otherUser = { ...USER_DOC, id: 'other-id-123' };
      mockCollections.users.findOne.mockResolvedValue(otherUser);

      const result = await getUserIdByEmail('test@example.com');

      expect(result).toBe('other-id-123');
    });
  });
});
