import { Elysia, t } from 'elysia';

import { collections } from '~/database/mongo';
import { InvalidSessionError } from '~/errors';
import { authMacro } from '~/macros/authMacro';
import { cookiesPlugin } from '~/plugins/cookies';
import { authCookieSchema } from '~/schemas/auth';
import { errorResponseSchema, successResponseSchema } from '~/schemas/common';
import { USER_ME_PROJECTION } from '~/schemas/users';
import { hashToken } from '~/utils/token';

export const sessionsRoutes = new Elysia({ prefix: '/sessions' })
  .use(authMacro)
  .use(cookiesPlugin)
  .get(
    '/',
    async ({ user }) => {
      const userDoc = await collections.users.findOne({ email: user.email });
      if (!userDoc) throw new InvalidSessionError('Utilisateur introuvable');

      const sessions = await collections.sessions
        .find({ userId: userDoc.id })
        .sort({ lastRefreshedAt: -1 })
        .toArray();

      const formattedSessions = sessions.map(
        ({ id, userAgent, ipAddress, createdAt, lastRefreshedAt, expiresAt }) => ({
          id,
          userAgent,
          ipAddress,
          createdAt,
          lastRefreshedAt,
          expiresAt,
        }),
      );

      return {
        sessions: formattedSessions,
        total: formattedSessions.length,
      };
    },
    {
      isAuth: true,
      response: {
        200: t.Object({
          sessions: t.Array(
            t.Object({
              id: t.String(),
              userAgent: t.String(),
              ipAddress: t.Union([t.String(), t.Null()]),
              createdAt: t.Date(),
              lastRefreshedAt: t.Date(),
              expiresAt: t.Date(),
            }),
          ),
          total: t.Number(),
        }),
        401: errorResponseSchema,
      },
      detail: {
        summary: 'List active sessions',
        description: 'Get all active sessions for the authenticated user',
        tags: ['Sessions'],
      },
    },
  )
  .get(
    '/current',
    async ({ user, authCookies }) => {
      const { session: currentSessionToken } = authCookies.get();
      if (!currentSessionToken) throw new InvalidSessionError('Missing session token');

      const userDoc = await collections.users.findOne(
        { email: user.email },
        { projection: USER_ME_PROJECTION },
      );
      if (!userDoc) throw new InvalidSessionError('Utilisateur introuvable');

      const currentSessionTokenHash = hashToken(currentSessionToken);
      const session = await collections.sessions.findOne({
        sessionTokenHash: currentSessionTokenHash,
        userId: userDoc.id,
      });

      if (!session) throw new InvalidSessionError('Session introuvable');

      return {
        success: true,
        data: {
          id: session.id,
          userAgent: session.userAgent,
          ipAddress: session.ipAddress,
          createdAt: session.createdAt,
          lastRefreshedAt: session.lastRefreshedAt,
          expiresAt: session.expiresAt,
        },
      };
    },
    {
      isAuth: true,
      response: {
        200: t.Object({
          success: t.Boolean(),
          data: t.Object({
            id: t.String(),
            userAgent: t.String(),
            ipAddress: t.Union([t.String(), t.Null()]),
            createdAt: t.Date(),
            lastRefreshedAt: t.Date(),
            expiresAt: t.Date(),
          }),
        }),
        401: errorResponseSchema,
      },
      detail: {
        summary: 'Get current session info',
        description: 'Get all active sessions for the authenticated user',
        tags: ['Sessions'],
      },
      cookie: authCookieSchema,
    },
  )
  .delete(
    '/:id',
    async ({ params, user }) => {
      const userDoc = await collections.users.findOne({ email: user.email });
      if (!userDoc) throw new InvalidSessionError('Utilisateur introuvable');

      // Ensure user can only delete their own sessions
      const result = await collections.sessions.deleteOne({
        id: params.id,
        userId: userDoc.id,
      });

      if (result.deletedCount === 0) {
        throw new InvalidSessionError('Session introuvable');
      }

      return {
        success: true,
        message: 'Session révoquée',
      };
    },
    {
      isAuth: true,
      params: t.Object({
        id: t.String(),
      }),
      response: {
        200: successResponseSchema,
        401: errorResponseSchema,
        404: errorResponseSchema,
      },
      detail: {
        summary: 'Sign out specific device',
        description: 'Revoke a specific session by ID',
        tags: ['Sessions'],
      },
    },
  )
  .delete(
    '/',
    async ({ user, authCookies }) => {
      const userDoc = await collections.users.findOne({ email: user.email });
      if (!userDoc) throw new InvalidSessionError('Utilisateur introuvable');

      const result = await collections.sessions.deleteMany({ userId: userDoc.id });

      authCookies.clear();

      return {
        success: true,
        message: `${result.deletedCount} session(s) révoquée(s)`,
      };
    },
    {
      isAuth: true,
      response: {
        200: successResponseSchema,
        401: errorResponseSchema,
      },
      detail: {
        summary: 'Sign out all devices',
        description: 'Revoke all sessions for the authenticated user',
        tags: ['Sessions'],
      },
    },
  );
