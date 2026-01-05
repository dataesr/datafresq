import { Elysia } from 'elysia';
import { cookiesPlugin } from './cookies';
import { jwtAccessToken } from './jwt';

/**
 * Auth Plugin
 *
 * Extracts and verifies JWT from cookie.
 * Injects user into context.
 * Does NOT enforce authentication - use isAuth macro for that.
 */

export const authPlugin = new Elysia({ name: 'auth-plugin' })
  .use(jwtAccessToken)
  .use(cookiesPlugin)
  .resolve({ as: 'global' }, async ({ jwtAccessToken, authCookies }) => {
    const { access } = authCookies.get();
    if (!access) return { user: null };

    const payload = await jwtAccessToken.verify(access);

    if (!payload) return { user: null };

    return {
      user: {
        id: payload.sub,
        email: payload.email.toLowerCase(),
        role: payload.role,
      },
    };
  })
  .as('global');
