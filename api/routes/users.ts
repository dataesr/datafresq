import { Elysia, t } from 'elysia';

import { collections } from '~/database/mongo';
import { authMacro } from '~/macros/authMacro';
import { errorResponseSchema } from '~/schemas/common';
import { USER_SEARCH_PROJECTION, userSearchSchema } from '~/schemas/users';
import { escapeRegex } from '~/utils/strings';

/**
 * Users routes
 * Provides endpoints for searching and retrieving user information
 */
export const usersRoutes = new Elysia({ prefix: '/users' })
  .use(authMacro)
  // Search users - requires authentication
  .get(
    '/search',
    async ({ query: { q, limit = '10' } }) => {
      if (!q || q.length < 2) {
        return [];
      }

      const searchLimit = Math.min(Number.parseInt(limit, 10) || 10, 50);
      const safeQuery = escapeRegex(q);

      const users = await collections.users
        .find(
          {
            isActive: true,
            $or: [
              { email: { $regex: safeQuery, $options: 'i' } },
              { firstName: { $regex: safeQuery, $options: 'i' } },
              { lastName: { $regex: safeQuery, $options: 'i' } },
            ],
          },
          {
            projection: USER_SEARCH_PROJECTION,
            limit: searchLimit,
          },
        )
        .toArray();

      return users;
    },
    {
      isAuth: true,
      query: t.Object({
        q: t.String({ minLength: 2, description: 'Search query (min 2 characters)' }),
        limit: t.Optional(t.String({ default: '10', description: 'Maximum number of results' })),
      }),
      response: {
        200: t.Array(userSearchSchema),
        401: errorResponseSchema,
      },
      detail: {
        summary: 'Search users',
        description:
          'Search for users by email, first name, or last name. Returns a list of matching users with basic info. Requires authentication.',
        tags: ['Utilisateurs'],
      },
    },
  )
  // Get user by ID - requires authentication
  .get(
    '/:id',
    async ({ params: { id } }) => {
      const user = await collections.users.findOne(
        { id, isActive: true },
        { projection: USER_SEARCH_PROJECTION },
      );

      return user;
    },
    {
      isAuth: true,
      params: t.Object({
        id: t.String(),
      }),
      response: {
        200: t.Nullable(userSearchSchema),
        401: errorResponseSchema,
      },
      detail: {
        summary: 'Get user by ID',
        description: 'Get basic user information by their ID. Requires authentication.',
        tags: ['Utilisateurs'],
      },
    },
  );
