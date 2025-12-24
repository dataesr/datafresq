/**
 * Token Utility
 *
 * Generates secure random tokens for password reset, email verification, etc.
 */

import { createHash, randomBytes } from 'node:crypto';
import { config } from '~/config';

export type SessionInfo = {
  sessionToken: string;
  sessionTokenHash: string;
  expiresAt: Date;
};

/**
 * Generate a secure random token
 * @param bytes - Number of random bytes (default: 32)
 * @returns Hex string token
 */
export function generateToken(bytes: number = 32): string {
  return randomBytes(bytes).toString('hex');
}

/**
 * Hash a token using SHA-256
 * Used to store token hashes in database instead of plaintext
 * @param token - The token to hash
 * @returns SHA-256 hash as hex string
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Generate a token and its hash
 * @returns Object with token and tokenHash
 */
export function generateTokenWithHash(): { token: string; tokenHash: string } {
  const token = generateToken();
  const tokenHash = hashToken(token);
  return { token, tokenHash };
}

export function generateSessionInfo(): SessionInfo {
  const sessionToken = generateToken(32);
  const sessionTokenHash = hashToken(sessionToken);

  const sessionExpSeconds = config.cookies.session.config.maxAge;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + sessionExpSeconds * 1000);

  return {
    sessionToken,
    sessionTokenHash,
    expiresAt,
  };
}
