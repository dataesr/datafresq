import { beforeEach, describe, expect, it } from 'bun:test';
import { generateToken, generateTokenWithHash, hashToken } from '~/utils/token';
import { resetAllMocks } from '../helpers/mock-db';

beforeEach(() => resetAllMocks());

describe('generateToken', () => {
  it('returns a hex string', () => {
    const token = generateToken();
    expect(token).toMatch(/^[0-9a-f]+$/);
  });

  it('defaults to 64 hex characters (32 bytes)', () => {
    const token = generateToken();
    expect(token).toHaveLength(64);
  });

  it('respects custom byte length', () => {
    const token = generateToken(16);
    expect(token).toHaveLength(32);
  });

  it('generates unique tokens on successive calls', () => {
    const token1 = generateToken();
    const token2 = generateToken();
    expect(token1).not.toBe(token2);
  });

  it('returns a non-empty string', () => {
    const token = generateToken(1);
    expect(token.length).toBeGreaterThan(0);
  });
});

describe('hashToken', () => {
  it('returns a hex string', () => {
    const hash = hashToken('test-token');
    expect(hash).toMatch(/^[0-9a-f]+$/);
  });

  it('returns a 64-character SHA-256 hex digest', () => {
    const hash = hashToken('test-token');
    expect(hash).toHaveLength(64);
  });

  it('is deterministic — same input always produces same hash', () => {
    const hash1 = hashToken('my-token');
    const hash2 = hashToken('my-token');
    expect(hash1).toBe(hash2);
  });

  it('produces different hashes for different inputs', () => {
    const hash1 = hashToken('token-a');
    const hash2 = hashToken('token-b');
    expect(hash1).not.toBe(hash2);
  });

  it('handles empty string', () => {
    const hash = hashToken('');
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]+$/);
  });
});

describe('generateTokenWithHash', () => {
  it('returns an object with token and tokenHash', () => {
    const result = generateTokenWithHash();
    expect(result).toHaveProperty('token');
    expect(result).toHaveProperty('tokenHash');
  });

  it('token is a valid hex string', () => {
    const { token } = generateTokenWithHash();
    expect(token).toMatch(/^[0-9a-f]+$/);
    expect(token).toHaveLength(64);
  });

  it('tokenHash is the SHA-256 hash of token', () => {
    const { token, tokenHash } = generateTokenWithHash();
    expect(tokenHash).toBe(hashToken(token));
  });

  it('generates unique token/hash pairs', () => {
    const a = generateTokenWithHash();
    const b = generateTokenWithHash();
    expect(a.token).not.toBe(b.token);
    expect(a.tokenHash).not.toBe(b.tokenHash);
  });
});
