import { Elysia, t } from 'elysia';

import { collections } from '~/database/mongo';
import { NotFoundError } from '~/errors';
import { DatabaseError } from '~/errors/database.error';
import { authMacro } from '~/macros/authMacro';
import { errorResponseSchema, successResponseSchema } from '~/schemas/common';
import { USER_ADMIN_PROJECTION, updateUserRoleSchema, userAdminSchema } from '~/schemas/users';

export const adminRoutes = new Elysia({ prefix: '/admin' })
  .use(authMacro)
  .get(
    '/users',
    async () => {
      const users = await collections.users
        .find({}, { projection: USER_ADMIN_PROJECTION })
        .toArray();

      return users;
    },
    {
      isAdmin: true,
      response: {
        200: t.Array(userAdminSchema),
        401: errorResponseSchema,
        403: errorResponseSchema,
      },
      detail: {
        summary: 'Lister les utilisateurs',
        description: 'Liste tous les utilisateurs du système (admin uniquement)',
        tags: ['Administration'],
      },
    },
  )
  .put(
    '/users/:id/role',
    async ({ params, body }) => {
      const user = await collections.users.findOne({ id: params.id });
      if (!user) throw new NotFoundError('Utilisateur introuvable');

      const { acknowledged, modifiedCount } = await collections.users.updateOne(
        { id: user.id },
        {
          $set: {
            role: body.role,
            updatedAt: new Date(),
          },
        },
      );

      if (!acknowledged) throw new DatabaseError('Failed to update user role');
      if (modifiedCount === 0) throw new DatabaseError('No changes made');

      return {
        success: true,
        message: 'Rôle modifié avec succès',
      };
    },
    {
      isAdmin: true,
      params: t.Object({
        id: t.String(),
      }),
      body: updateUserRoleSchema,
      response: {
        200: successResponseSchema,
        401: errorResponseSchema,
        403: errorResponseSchema,
        404: errorResponseSchema,
        500: errorResponseSchema,
      },
      detail: {
        summary: "Modifier le rôle d'un utilisateur",
        description: "Change le rôle d'un utilisateur (admin uniquement)",
        tags: ['Administration'],
      },
    },
  )
  .delete(
    '/users/:id',
    async ({ params }) => {
      const user = await collections.users.findOne({ id: params.id });
      if (!user) throw new NotFoundError('Utilisateur introuvable');

      const { acknowledged, modifiedCount } = await collections.users.updateOne(
        { id: user.id },
        {
          $set: {
            isActive: false,
            updatedAt: new Date(),
          },
        },
      );

      if (!acknowledged) throw new DatabaseError('Failed to deactivate user');
      if (modifiedCount === 0) throw new DatabaseError('No changes made');

      await collections.sessions.deleteMany({ userId: user.id });

      return {
        success: true,
        message: 'Utilisateur désactivé avec succès',
      };
    },
    {
      isAdmin: true,
      params: t.Object({
        id: t.String(),
      }),
      response: {
        200: successResponseSchema,
        401: errorResponseSchema,
        403: errorResponseSchema,
        404: errorResponseSchema,
        500: errorResponseSchema,
      },
      detail: {
        summary: 'Supprimer un utilisateur',
        description: 'Désactive un utilisateur et révoque ses sessions (admin uniquement)',
        tags: ['Administration'],
      },
    },
  )
  .delete(
    '/users/:id/sessions',
    async ({ params }) => {
      const user = await collections.users.findOne({ id: params.id });
      if (!user) throw new NotFoundError('Utilisateur introuvable');

      const result = await collections.sessions.deleteMany({ userId: user.id });

      return {
        success: true,
        message: `${result.deletedCount} session(s) révoquée(s)`,
      };
    },
    {
      isAdmin: true,
      params: t.Object({
        id: t.String(),
      }),
      response: {
        200: successResponseSchema,
        401: errorResponseSchema,
        403: errorResponseSchema,
        404: errorResponseSchema,
      },
      detail: {
        summary: "Révoquer les sessions d'un utilisateur",
        description: "Révoque toutes les sessions actives d'un utilisateur (admin uniquement)",
        tags: ['Administration'],
      },
    },
  );
