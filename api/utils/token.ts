import { config } from '~/config';

export type SessionInfo = {
  sessionToken: string;
  sessionTokenHash: string;
  expiresAt: Date;
};

export function generateToken(bytes = 32): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Buffer.from(arr).toString('hex');
}

export function hashToken(token: string): string {
  const hasher = new Bun.CryptoHasher('sha256');
  hasher.update(token);
  return hasher.digest('hex');
}

export function generateTokenWithHash(): { token: string; tokenHash: string } {
  const token = generateToken();
  const tokenHash = hashToken(token);
  return { token, tokenHash };
}

export function generateSessionInfo(): SessionInfo {
  const sessionToken = generateToken(32);
  const sessionTokenHash = hashToken(sessionToken);

  const sessionExpSeconds = config.cookies.session.config.maxAge;
  const expiresAt = new Date(Date.now() + sessionExpSeconds * 1000);

  return {
    sessionToken,
    sessionTokenHash,
    expiresAt,
  };
}
