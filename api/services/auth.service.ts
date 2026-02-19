import { config } from '~/config';
import { collections } from '~/database/mongo';
import type { UserRole } from '~/database/types';
import {
  AccountInactiveError,
  BadRequestError,
  DatabaseError,
  InvalidCredentialsError,
  InvalidSessionError,
  InvalidTokenError,
  MailerFailedError,
  NotFoundError,
} from '~/errors';
import { sendInvitationEmail, sendPasswordResetEmail } from '~/external/email';
import { generateId } from '~/utils/id';
import { hashPassword, verifyPassword } from '~/utils/password';
import { generateSessionInfo, generateTokenWithHash, hashToken } from '~/utils/token';

interface ClientInfo {
  userAgent: string;
  ipAddress: string | null;
}

interface SigninResult {
  accessTokenPayload: { sub: string; email: string; role: UserRole };
  sessionToken: string;
}

interface RefreshResult {
  accessTokenPayload: { sub: string; email: string; role: UserRole };
  sessionToken: string;
}

export async function signin(
  email: string,
  password: string,
  clientInfo: ClientInfo,
): Promise<SigninResult> {
  const user = await collections.users.findOne({ email: email.toLowerCase() });
  if (!user) throw new InvalidCredentialsError();
  if (!user.isActive) throw new AccountInactiveError();
  if (!user.passwordHash) throw new InvalidCredentialsError();

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) throw new InvalidCredentialsError();

  const { sessionToken, ...sessionInfo } = generateSessionInfo();

  await collections.sessions.insertOne({
    id: generateId(),
    userId: user.id,
    userAgent: clientInfo.userAgent,
    ipAddress: clientInfo.ipAddress,
    createdAt: new Date(),
    lastRefreshedAt: new Date(),
    ...sessionInfo,
  });

  await collections.users.updateOne({ id: user.id }, { $set: { lastLogin: new Date() } });

  return {
    accessTokenPayload: { sub: user.id, email: user.email, role: user.role },
    sessionToken,
  };
}

export async function signout(sessionToken: string | undefined) {
  if (sessionToken) {
    const tokenHash = hashToken(sessionToken);
    await collections.sessions.deleteOne({ sessionTokenHash: tokenHash });
  }
}

export async function refreshSession(
  currentSessionToken: string,
  clientInfo: ClientInfo,
): Promise<RefreshResult> {
  const currentSessionTokenHash = hashToken(currentSessionToken);

  const session = await collections.sessions.findOne({
    sessionTokenHash: currentSessionTokenHash,
  });

  if (!session) throw new InvalidSessionError('Session invalide ou expirée');

  if (session.expiresAt < new Date()) {
    console.warn('Session expired within mongo TTL delay');
    throw new InvalidSessionError('Session expirée');
  }

  const user = await collections.users.findOne({ id: session.userId });
  if (!user || !user.isActive) {
    await collections.sessions.deleteOne({ id: session.id });
    throw new InvalidSessionError('Utilisateur invalide');
  }

  const { sessionToken, ...sessionInfo } = generateSessionInfo();

  await collections.sessions.updateOne(
    { id: session.id, userId: user.id },
    {
      $set: {
        userAgent: clientInfo.userAgent,
        ipAddress: clientInfo.ipAddress,
        lastRefreshedAt: new Date(),
        ...sessionInfo,
      },
    },
  );

  return {
    accessTokenPayload: { sub: user.id, email: user.email, role: user.role },
    sessionToken,
  };
}

export async function forgotPassword(email: string, requestUrl: string) {
  const user = await collections.users.findOne({ email: email.toLowerCase() });
  if (!user) return;

  const { token, tokenHash } = generateTokenWithHash();

  const expiresAt = new Date(Date.now() + config.tokens.resetPasswordExpSeconds * 1000);
  const tokenInput = {
    id: generateId(),
    userId: user.id,
    type: 'reset-password' as const,
    tokenHash,
    createdAt: new Date(),
    expiresAt,
    used: false,
    usedAt: null,
  };

  await collections.tokens.insertOne(tokenInput);

  const url = new URL(requestUrl);
  url.pathname = '/auth/reinitialiser-mot-de-passe';
  url.searchParams.set('token', token);

  const emailResponse = await sendPasswordResetEmail(email, url.toString());

  if (!emailResponse.ok) {
    console.error('Failed to send reset password email:', await emailResponse.text());
    throw new MailerFailedError();
  }
}

export async function resetPassword(token: string, newPassword: string) {
  const tokenHash = hashToken(token);

  const tokenDoc = await collections.tokens.findOne({
    tokenHash,
    type: 'reset-password',
    used: false,
  });

  if (!tokenDoc) throw new InvalidTokenError('Token invalide ou expiré');
  if (tokenDoc.expiresAt < new Date()) throw new InvalidTokenError('Token expiré');

  const passwordHash = await hashPassword(newPassword);

  await collections.users.updateOne(
    { id: tokenDoc.userId },
    {
      $set: {
        passwordHash,
        lastPasswordChange: new Date(),
        updatedAt: new Date(),
      },
    },
  );

  await collections.tokens.updateOne(
    { id: tokenDoc.id },
    { $set: { used: true, usedAt: new Date() } },
  );

  await collections.sessions.deleteMany({ userId: tokenDoc.userId });
}

export async function inviteUser(email: string, requestUrl: string) {
  const now = new Date();
  const normalizedEmail = email.toLowerCase();

  const existingUser = await collections.users.findOne({ email: normalizedEmail });
  if (existingUser?.isActive) throw new BadRequestError('Utilisateur déjà actif');

  const userId = existingUser?.id ?? generateId();
  const userInput = {
    id: userId,
    email: normalizedEmail,
    firstName: null,
    lastName: null,
    role: 'user' as const,
    isActive: false,
    lastLogin: null,
    lastPasswordChange: null,
    createdAt: now,
    updatedAt: now,
  };

  await collections.users.updateOne(
    { email: normalizedEmail },
    { $set: { ...userInput } },
    { upsert: true },
  );

  const user = await collections.users.findOne({ email: normalizedEmail });
  if (!user) throw new DatabaseError("Échec de la création de l'utilisateur");

  const { token, tokenHash } = generateTokenWithHash();

  const expiresAt = new Date(Date.now() + config.tokens.invitationExpSeconds * 1000);
  const tokenInput = {
    id: generateId(),
    userId: user.id,
    type: 'invitation' as const,
    tokenHash,
    createdAt: new Date(),
    expiresAt,
    used: false,
    usedAt: null,
  };

  await collections.tokens.insertOne(tokenInput);

  const url = new URL(requestUrl);
  url.pathname = '/auth/inscription';
  url.searchParams.set('token', token);

  const emailResponse = await sendInvitationEmail(email, url.toString());

  if (!emailResponse.ok) {
    console.error('Failed to send invitation email:', await emailResponse.text());
    throw new MailerFailedError();
  }
}

export async function registerFromInvitation(
  token: string,
  firstName: string,
  lastName: string,
  password: string,
) {
  const tokenHash = hashToken(token);
  const payload = await collections.tokens.findOne({
    tokenHash,
    type: 'invitation',
    used: false,
    expiresAt: { $gt: new Date() },
  });

  if (!payload || !payload.userId) {
    throw new InvalidTokenError("Token d'invitation invalide");
  }

  const user = await collections.users.findOne({
    id: payload.userId,
    isActive: false,
  });

  if (!user) throw new InvalidTokenError("Token d'invitation invalide ou expiré");

  const passwordHash = await hashPassword(password);

  const { acknowledged } = await collections.users.updateOne(
    { id: user.id },
    {
      $set: {
        passwordHash,
        firstName,
        lastName,
        isActive: true,
        updatedAt: new Date(),
      },
    },
  );

  if (!acknowledged) throw new DatabaseError("Échec de l'activation du compte utilisateur");
}

export async function changePassword(
  userEmail: string,
  currentPassword: string,
  newPassword: string,
) {
  const user = await collections.users.findOne({ email: userEmail });
  if (!user) throw new NotFoundError('Utilisateur introuvable');

  if (!user.passwordHash) throw new InvalidCredentialsError('Mot de passe actuel incorrect');
  const isValid = await verifyPassword(currentPassword, user.passwordHash);
  if (!isValid) throw new InvalidCredentialsError('Mot de passe actuel incorrect');

  const newPasswordHash = await hashPassword(newPassword);

  await collections.users.updateOne(
    { id: user.id },
    {
      $set: {
        passwordHash: newPasswordHash,
        lastPasswordChange: new Date(),
        updatedAt: new Date(),
      },
    },
  );
}
