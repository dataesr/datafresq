import { Elysia } from 'elysia';
import { config } from '~/config';

import { collections } from '~/database/mongo';
import {
  AccountInactiveError,
  InvalidCredentialsError,
  InvalidSessionError,
  InvalidTokenError,
  JWTFailedError,
  MailerFailedError,
} from '~/errors';
import { sendPasswordResetEmail } from '~/external/email';
import { rateLimitMacro } from '~/macros/rateLimitMacro';
import { clientInfoPlugin } from '~/plugins/client-info';
import { cookiesPlugin } from '~/plugins/cookies';
import { jwtAccessToken } from '~/plugins/jwt';
import {
  authCookieSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  signinSchema,
} from '~/schemas/auth';
import { errorResponseSchema, successResponseSchema } from '~/schemas/common';
import { generateId } from '~/utils/id';
import { generateSessionInfo, generateTokenWithHash, hashToken } from '~/utils/token';

export const authRoutes = new Elysia({ prefix: '/auth' })
  .use(jwtAccessToken)
  .use(clientInfoPlugin)
  .use(cookiesPlugin)
  .use(rateLimitMacro)
  .post(
    '/signin',
    async ({ body, jwtAccessToken, clientInfo: { userAgent, ipAddress }, authCookies }) => {
      const user = await collections.users.findOne({ email: body.email.toLowerCase() });
      if (!user) throw new InvalidCredentialsError();
      if (!user.isActive) throw new AccountInactiveError();

      const isPasswordValid = await Bun.password.verify(body.password, user.passwordHash || '');
      if (!isPasswordValid) throw new InvalidCredentialsError();

      const payload = { email: user.email, role: user.role };
      const accessToken = await jwtAccessToken.sign(payload);
      const { sessionToken, ...sessionInfo } = generateSessionInfo();

      await collections.sessions.insertOne({
        id: generateId(),
        userId: user.id,
        userAgent,
        ipAddress,
        createdAt: new Date(),
        lastRefreshedAt: new Date(),
        ...sessionInfo,
      });

      await collections.users.updateOne({ id: user.id }, { $set: { lastLogin: new Date() } });

      authCookies.set(accessToken, sessionToken);

      return {
        success: true,
        message: 'Connexion réussie',
      };
    },
    {
      body: signinSchema,
      response: {
        200: successResponseSchema,
        401: errorResponseSchema,
        403: errorResponseSchema,
        422: errorResponseSchema,
        429: errorResponseSchema,
      },
      detail: {
        summary: 'Connexion utilisateur',
        description: 'Authentifier un utilisateur avec son email et mot de passe',
        tags: ['Authentification'],
      },
      rateLimit: {
        maxRequests: 5,
        windowSeconds: 60,
        key: 'signin',
        message: 'Trop de tentatives de connexion. Veuillez réessayer dans quelques instants.',
      },
    },
  )
  .post(
    '/session/refresh',
    async ({ jwtAccessToken, clientInfo: { userAgent, ipAddress }, authCookies }) => {
      const { session: currentSessionToken } = authCookies.get();
      if (!currentSessionToken) throw new InvalidSessionError('Missing session token');

      const currentSessionTokenHash = hashToken(currentSessionToken);

      const session = await collections.sessions.findOne({
        sessionTokenHash: currentSessionTokenHash,
      });

      if (!session) throw new InvalidSessionError('Invalid or expired session');
      if (session.expiresAt < new Date()) {
        console.warn('Session renewed within mongo TTL delay');
      }

      const user = await collections.users.findOne({ id: session.userId });
      if (!user || !user.isActive) {
        throw new InvalidSessionError('Utilisateur invalide');
      }

      const payload = { email: user.email, role: user.role };
      const accessToken = await jwtAccessToken.sign(payload);
      if (!accessToken) throw new JWTFailedError();

      const { sessionToken, ...sessionInfo } = generateSessionInfo();

      // Revoke old session
      await collections.sessions.updateOne(
        { id: session.id, userId: user.id },
        {
          $set: {
            userAgent,
            ipAddress,
            lastRefreshedAt: new Date(),
            ...sessionInfo,
          },
        },
      );

      authCookies.set(accessToken, sessionToken);

      return {
        success: true,
        message: 'Session renouvelée avec succès',
      };
    },
    {
      response: {
        200: successResponseSchema,
        401: errorResponseSchema,
      },
      detail: {
        summary: "Renouveler le token d'accès",
        description:
          "Obtenir un nouveau token d'accès en utilisant le token de session (avec rotation)",
        tags: ['Authentification'],
      },
    },
  )
  .post(
    '/signout',
    async ({ authCookies }) => {
      const { session } = authCookies.get();

      if (session) {
        const tokenHash = hashToken(session);
        await collections.sessions.deleteOne({ sessionTokenHash: tokenHash });
      }

      authCookies.clear();

      return {
        success: true,
        message: 'Déconnexion réussie',
      };
    },
    {
      response: {
        200: successResponseSchema,
        422: errorResponseSchema,
      },
      detail: {
        summary: 'Déconnexion utilisateur',
        description: 'Révoquer la session et supprimer les cookies',
        tags: ['Authentification'],
      },
      cookie: authCookieSchema,
    },
  )
  .post(
    '/mot-de-passe-oublie',
    async ({ body, request }) => {
      const user = await collections.users.findOne({ email: body.email.toLowerCase() });
      if (!user) {
        return {
          success: true,
          message: 'Si cet email existe, un lien de réinitialisation a été envoyé',
        };
      }

      const { token, tokenHash } = generateTokenWithHash();

      const expiresAt = new Date(Date.now() + config.tokens.resetPasswordExpSeconds);
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

      const url = new URL(request.url);
      url.pathname = '/auth/reinitialiser-mot-de-passe';
      url.searchParams.set('token', token);

      const emailResponse = await sendPasswordResetEmail(body.email, url.toString());

      if (!emailResponse.ok) {
        console.error('Failed to send reset password email:', await emailResponse.text());
        throw new MailerFailedError();
      }

      return {
        success: true,
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé',
      };
    },
    {
      body: forgotPasswordSchema,
      response: {
        200: successResponseSchema,
        422: errorResponseSchema,
        429: errorResponseSchema,
      },
      detail: {
        summary: 'Mot de passe oublié',
        description: "Envoyer un token de réinitialisation à l'email de l'utilisateur",
        tags: ['Authentification'],
      },
      rateLimit: {
        maxRequests: 3,
        windowSeconds: 300,
        key: 'forgot-password',
        message: 'Trop de demandes de réinitialisation. Veuillez réessayer dans quelques minutes.',
      },
    },
  )
  /**
   * POST /auth/reinitialiser-mot-de-passe
   *
   * Réinitialiser le mot de passe avec le token envoyé par email.
   */
  .post(
    '/reinitialiser-mot-de-passe',
    async ({ body }) => {
      // Hash the token to find it in database
      const tokenHash = hashToken(body.token);

      // Find token
      const tokenDoc = await collections.tokens.findOne({
        tokenHash,
        type: 'reset-password',
        used: false,
      });

      if (!tokenDoc) {
        throw new InvalidTokenError('Token invalide ou expiré');
      }

      // Check if token is expired
      if (tokenDoc.expiresAt < new Date()) {
        throw new InvalidTokenError('Token expiré');
      }

      // Hash new password
      const passwordHash = await Bun.password.hash(body.password);

      // Update user password
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

      // Mark token as used
      await collections.tokens.updateOne(
        { id: tokenDoc.id },
        {
          $set: {
            used: true,
            usedAt: new Date(),
          },
        },
      );

      // Revoke all sessions for security (force re-login)
      await collections.sessions.deleteMany({ userId: tokenDoc.userId });

      return {
        success: true,
        message: 'Mot de passe réinitialisé avec succès',
      };
    },
    {
      body: resetPasswordSchema,
      response: {
        200: successResponseSchema,
        400: errorResponseSchema,
        422: errorResponseSchema,
        429: errorResponseSchema,
      },
      detail: {
        summary: 'Réinitialiser le mot de passe',
        description:
          "Réinitialiser le mot de passe de l'utilisateur avec le token de réinitialisation",
        tags: ['Authentification'],
      },
      rateLimit: {
        maxRequests: 5,
        windowSeconds: 300,
        key: 'reset-password',
        message:
          'Trop de tentatives de réinitialisation. Veuillez réessayer dans quelques minutes.',
      },
    },
  );
