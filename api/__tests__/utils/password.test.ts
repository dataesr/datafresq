import { beforeEach, describe, expect, it } from 'bun:test';
import { hashPassword, verifyPassword } from '~/utils/password';
import { resetAllMocks } from '../helpers/mock-db';

beforeEach(() => resetAllMocks());

describe('hashPassword', () => {
  it('returns a non-empty string', async () => {
    const hash = await hashPassword('my-password');
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
  });

  it('produces an argon2id hash', async () => {
    const hash = await hashPassword('my-password');
    expect(hash).toContain('argon2id');
  });

  it('produces different hashes for the same password (salted)', async () => {
    const hash1 = await hashPassword('same-password');
    const hash2 = await hashPassword('same-password');
    expect(hash1).not.toBe(hash2);
  });

  it('produces different hashes for different passwords', async () => {
    const hash1 = await hashPassword('password-one');
    const hash2 = await hashPassword('password-two');
    expect(hash1).not.toBe(hash2);
  });

  it('handles long passwords', async () => {
    const longPassword = 'a'.repeat(256);
    const hash = await hashPassword(longPassword);
    expect(hash).toContain('argon2id');
  });

  it('handles passwords with unicode characters', async () => {
    const hash = await hashPassword('motdepàsse-été-café');
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
  });

  it('handles passwords with special characters', async () => {
    const hash = await hashPassword('p@$$w0rd!#%^&*()');
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
  });
});

describe('verifyPassword', () => {
  it('returns true for correct password', async () => {
    const hash = await hashPassword('correct-password');
    const result = await verifyPassword('correct-password', hash);
    expect(result).toBe(true);
  });

  it('returns false for wrong password', async () => {
    const hash = await hashPassword('correct-password');
    const result = await verifyPassword('wrong-password', hash);
    expect(result).toBe(false);
  });

  it('returns false for empty password against a valid hash', async () => {
    const hash = await hashPassword('some-password');
    const result = await verifyPassword('', hash);
    expect(result).toBe(false);
  });

  it('verifies passwords with special characters', async () => {
    const password = 'p@$$w0rd!#%^&*()';
    const hash = await hashPassword(password);
    const result = await verifyPassword(password, hash);
    expect(result).toBe(true);
  });

  it('verifies passwords with unicode characters', async () => {
    const password = 'motdepàsse-été-café';
    const hash = await hashPassword(password);
    const result = await verifyPassword(password, hash);
    expect(result).toBe(true);
  });

  it('returns false for a password that is a substring of the original', async () => {
    const hash = await hashPassword('my-long-password');
    const result = await verifyPassword('my-long', hash);
    expect(result).toBe(false);
  });

  it('returns false for a password with extra characters appended', async () => {
    const hash = await hashPassword('my-password');
    const result = await verifyPassword('my-password-extra', hash);
    expect(result).toBe(false);
  });

  it('is case-sensitive', async () => {
    const hash = await hashPassword('MyPassword');
    const result = await verifyPassword('mypassword', hash);
    expect(result).toBe(false);
  });

  it('verifies the same password against two different hashes', async () => {
    const password = 'shared-password';
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);
    expect(hash1).not.toBe(hash2);
    expect(await verifyPassword(password, hash1)).toBe(true);
    expect(await verifyPassword(password, hash2)).toBe(true);
  });
});
