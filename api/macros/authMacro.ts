import { Elysia } from 'elysia';
import { ForbiddenError, UnauthorizedError } from '~/errors';
import { authPlugin } from '~/plugins/auth';
import type { JWTPayload } from '~/plugins/jwt';

export type Role = JWTPayload['role'];
export type Allow = 'visitor' | Role | Role[];

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
    allow(value: Allow) {
      if (value === 'visitor') return;

      const roles = Array.isArray(value) ? value : [value];

      return {
        beforeHandle({ user }) {
          if (!user) {
            throw new UnauthorizedError('Authentication required');
          }
          if (!roles.includes(user.role as Role)) {
            throw new ForbiddenError('Insufficient privileges');
          }
        },
      };
    },
  })
  .as('global');
