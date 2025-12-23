import { Elysia } from 'elysia';

import { collections } from '~/database/mongo';
import { InvalidCredentialsError, NotFoundError } from '~/errors';
import { authMacro } from '~/macros/authMacro';
import { errorResponseSchema, successResponseSchema } from '~/schemas/common';
import {
  changePasswordSchema,
  USER_ME_PROJECTION,
  updateUserSchema,
  userMeSchema,
} from '~/schemas/users';

export const meRoutes = new Elysia({ prefix: '/me' })
  .use(authMacro)
  .get(
    '/',
    async ({ user }) => {
      const userDoc = await collections.users.findOne(
        { email: user.email },
        { projection: USER_ME_PROJECTION },
      );
      if (!userDoc) throw new NotFoundError('Utilisateur introuvable');

      return userDoc;
    },
    {
      isAuth: true,
      response: {
        200: userMeSchema,
        401: errorResponseSchema,
        404: errorResponseSchema,
        422: errorResponseSchema,
      },
      detail: {
        summary: 'Get current user infos',
        description: 'Get current user infos',
        tags: ['Utilisateur'],
      },
    },
  )
  .patch(
    '/',
    async ({ user, body }) => {
      const userDoc = await collections.users.findOne({ email: user.email });
      if (!userDoc) throw new NotFoundError('Utilisateur introuvable');

      const updateData: Record<string, unknown> = { updatedAt: new Date() };
      if (body.firstName !== undefined) updateData.firstName = body.firstName;
      if (body.lastName !== undefined) updateData.lastName = body.lastName;

      await collections.users.updateOne({ id: userDoc.id }, { $set: updateData });

      const updatedUser = await collections.users.findOne(
        { id: userDoc.id },
        { projection: USER_ME_PROJECTION },
      );
      if (!updatedUser) throw new NotFoundError('Utilisateur introuvable');

      return updatedUser;
    },
    {
      isAuth: true,
      body: updateUserSchema,
      response: {
        200: userMeSchema,
        401: errorResponseSchema,
        404: errorResponseSchema,
        422: errorResponseSchema,
      },
      detail: {
        summary: 'Update current user profile',
        description: 'Update the authenticated user profile information',
        tags: ['Utilisateur'],
      },
    },
  )
  .post(
    '/change-password',
    async ({ user, body }) => {
      const userDoc = await collections.users.findOne({ email: user.email });
      if (!userDoc) throw new NotFoundError('Utilisateur introuvable');

      const isPasswordValid = await Bun.password.verify(
        body.currentPassword,
        userDoc.passwordHash || '',
      );
      if (!isPasswordValid) {
        throw new InvalidCredentialsError('Mot de passe actuel incorrect');
      }

      const newPasswordHash = await Bun.password.hash(body.newPassword);

      await collections.users.updateOne(
        { id: userDoc.id },
        {
          $set: {
            passwordHash: newPasswordHash,
            lastPasswordChange: new Date(),
            updatedAt: new Date(),
          },
        },
      );

      return {
        success: true,
        message: 'Mot de passe modifié avec succès',
      };
    },
    {
      isAuth: true,
      body: changePasswordSchema,
      response: {
        200: successResponseSchema,
        401: errorResponseSchema,
        404: errorResponseSchema,
        422: errorResponseSchema,
      },
      detail: {
        summary: 'Change password',
        description: 'Change the authenticated user password',
        tags: ['Utilisateur'],
      },
    },
  );
