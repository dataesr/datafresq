import { Elysia } from 'elysia';

import { config } from '~/config';
import { collections } from '~/database/mongo';
import { InvalidTokenError, MailerFailedError } from '~/errors';
import { DatabaseError } from '~/errors/database.error';
import { sendInvitationEmail } from '~/external/email';
import { authMacro } from '~/macros/authMacro';
import { rateLimitMacro } from '~/macros/rateLimitMacro';
import { inviteUserSchema, registerSchema } from '~/schemas/auth';
import { errorResponseSchema, successResponseSchema } from '~/schemas/common';
import { generateId } from '~/utils/id';
import { generateTokenWithHash, hashToken } from '~/utils/token';

export const invitationRoutes = new Elysia({ prefix: '/invitations' })
  .use(rateLimitMacro)
  .use(authMacro)
  .post(
    '/',
    async ({ body, request }) => {
      const now = new Date();
      const email = body.email.toLowerCase();

      const existingUser = await collections.users.findOne({ email });

      const userId = existingUser?.id ?? generateId();
      const userInput = {
        id: userId,
        email,
        firstName: null,
        lastName: null,
        role: 'user' as const,
        isActive: false,
        lastLogin: null,
        lastPasswordChange: null,
        createdAt: now,
        updatedAt: now,
      };

      await collections.users.updateOne({ email }, { $set: { ...userInput } }, { upsert: true });

      const user = await collections.users.findOne({ email });
      if (!user) throw new DatabaseError('Failed to create user');

      const { token, tokenHash } = generateTokenWithHash();

      const expiresAt = new Date(Date.now() + config.tokens.invitationExpSeconds);
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

      const url = new URL(request.url);
      url.pathname = '/auth/inscription';
      url.searchParams.set('token', token);

      const emailResponse = await sendInvitationEmail(body.email, url.toString());

      if (!emailResponse.ok) {
        console.error('Failed to send invitation email:', await emailResponse.text());
        throw new MailerFailedError();
      }

      return {
        message: 'Invitation envoyée',
      };
    },
    {
      body: inviteUserSchema,
      response: {
        200: successResponseSchema,
        400: errorResponseSchema,
        403: errorResponseSchema,
        500: errorResponseSchema,
      },
      detail: {
        summary: 'Inviter un utilisateur',
        description: "Créer un compte utilisateur en attente et envoyer l'email d'invitation",
        tags: ['Administration'],
      },
      isAdmin: true,
    },
  )
  .post(
    '/register',
    async ({ body }) => {
      const tokenHash = hashToken(body.token);
      const payload = await collections.tokens.findOne({ tokenHash });

      if (!payload || !payload.userId) {
        throw new InvalidTokenError("Token d'invitation invalide");
      }

      const user = await collections.users.findOne({
        id: payload.userId,
        isActive: false,
      });

      if (!user) throw new InvalidTokenError("Token d'invitation invalide ou expiré");

      const passwordHash = await Bun.password.hash(body.password);

      const { acknowledged } = await collections.users.updateOne(
        { id: user.id },
        {
          $set: {
            passwordHash,
            firstName: body.firstName,
            lastName: body.lastName,
            isActive: true,
            updatedAt: new Date(),
          },
        },
      );

      if (!acknowledged) throw new DatabaseError('Failed to activate user account');

      return {
        message: 'Compte activé. Vous pouvez vous connecter',
      };
    },
    {
      body: registerSchema,
      response: {
        200: successResponseSchema,
        400: errorResponseSchema,
        401: errorResponseSchema,
        429: errorResponseSchema,
        500: errorResponseSchema,
      },
      detail: {
        summary: 'Créer un mot de passe',
        description: 'Activer le compte utilisateur en créant un mot de passe',
        tags: ['Authentification'],
      },
      rateLimit: {
        maxRequests: 5,
        windowSeconds: 300,
        key: 'register',
        message: "Trop de tentatives d'inscription. Veuillez réessayer dans quelques minutes.",
      },
    },
  );
