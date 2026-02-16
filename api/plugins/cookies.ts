import { Elysia } from 'elysia';
import { config } from '~/config';

export const cookiesPlugin = new Elysia({ name: 'cookies' })
  .resolve(({ cookie }) => ({
    authCookies: {
      set: (access: string, session: string) => {
        cookie[config.cookies.access.name]?.set({ value: access, ...config.cookies.access.config });
        cookie[config.cookies.session.name]?.set({
          value: session,
          ...config.cookies.session.config,
        });
      },

      clear: () => {
        cookie[config.cookies.access.name]?.remove();
        cookie[config.cookies.session.name]?.remove();
      },

      get: () => {
        const access = cookie[config.cookies.access.name]?.value as string | undefined;
        const session = cookie[config.cookies.session.name]?.value as string | undefined;
        return { access, session };
      },
    },
  }))
  .as('global');
