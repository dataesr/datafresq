import { Elysia } from 'elysia';
import { ForbiddenError, UnauthorizedError } from '~/errors/auth.errors';
import { authPlugin } from '~/plugins/auth';

export const authMacro = new Elysia({ name: 'auth-macro' })
  .use(authPlugin)
  .macro({
    isAuth: {
      resolve: ({ user }) => {
        if (!user) {
          throw new UnauthorizedError('Authentication required');
        }
        return { user };
      },
    },
    isAdmin: {
      resolve: ({ user }) => {
        if (!user) {
          throw new ForbiddenError('Authentication required');
        }
        if (user.role !== 'admin' && user.role !== 'root') {
          throw new ForbiddenError('Admin privileges required');
        }
        return { user };
      },
    },
    requireRole(role: string) {
      return {
        resolve({ user }) {
          if (!user) {
            throw new ForbiddenError('Authentication required');
          }
          if (user.role !== role) {
            throw new ForbiddenError('Privilege required');
          }
          return { user };
        },
      };
    },
  })
  .as('global');
