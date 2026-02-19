import { collections } from '~/database/mongo';
import { InvalidSessionError, NotFoundError } from '~/errors';
import { hashToken } from '~/utils/token';

async function getUserIdByEmail(email: string): Promise<string> {
  const user = await collections.users.findOne({ email });
  if (!user) throw new NotFoundError('Utilisateur introuvable');
  return user.id;
}

export async function listSessions(userId: string) {
  const sessions = await collections.sessions
    .find({ userId })
    .sort({ lastRefreshedAt: -1 })
    .toArray();

  return sessions.map(({ id, userAgent, ipAddress, createdAt, lastRefreshedAt, expiresAt }) => ({
    id,
    userAgent,
    ipAddress,
    createdAt,
    lastRefreshedAt,
    expiresAt,
  }));
}

export async function getCurrentSession(userId: string, sessionToken: string) {
  const sessionTokenHash = hashToken(sessionToken);
  const session = await collections.sessions.findOne({
    sessionTokenHash,
    userId,
  });

  if (!session) throw new InvalidSessionError('Session introuvable');

  return {
    id: session.id,
    userAgent: session.userAgent,
    ipAddress: session.ipAddress,
    createdAt: session.createdAt,
    lastRefreshedAt: session.lastRefreshedAt,
    expiresAt: session.expiresAt,
  };
}

export async function revokeSession(sessionId: string, userId: string) {
  const result = await collections.sessions.deleteOne({ id: sessionId, userId });
  if (result.deletedCount === 0) throw new InvalidSessionError('Session introuvable');
}

export async function revokeAllSessions(userId: string) {
  const result = await collections.sessions.deleteMany({ userId });
  return result.deletedCount;
}

export async function listSessionsForEmail(email: string) {
  const userId = await getUserIdByEmail(email);
  return listSessions(userId);
}

export async function getCurrentSessionForEmail(email: string, sessionToken: string) {
  const userId = await getUserIdByEmail(email);
  return getCurrentSession(userId, sessionToken);
}

export async function revokeSessionForEmail(sessionId: string, email: string) {
  const userId = await getUserIdByEmail(email);
  return revokeSession(sessionId, userId);
}

export async function revokeAllSessionsForEmail(email: string) {
  const userId = await getUserIdByEmail(email);
  return revokeAllSessions(userId);
}
