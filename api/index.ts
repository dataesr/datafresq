import { openapi } from '@elysiajs/openapi';
import { serverTiming } from '@elysiajs/server-timing';
import { Elysia } from 'elysia';
import { errorHandler } from '~/plugins/error-handler';
import { adminRoutes } from '~/routes/admin';
import { authRoutes } from '~/routes/auth';
import { programsRoutes } from '~/routes/programs';
import workspacesRoutes from '~/routes/workspaces';
import { logger } from './plugins/logger';
import { invitationRoutes } from './routes/invitations';
import { meRoutes } from './routes/me';
import { sessionsRoutes } from './routes/sessions';
import { errorResponseSchema } from './schemas/common';

export const app = new Elysia({ prefix: '/api' })
  .use(serverTiming())
  .use(logger())
  .use(
    openapi({
      documentation: {
        info: {
          title: 'Fresqviz API',
          version: '1.0.0',
          description: 'API documentation for Fresqviz application',
        },
        tags: [
          { name: 'Authentification', description: 'Authentication endpoints' },
          { name: 'Administration', description: "Routes permettant l'administration du site" },
          { name: 'Utilisateurs', description: 'Routes relatives aux utilisateurs' },
          { name: 'Formations', description: 'Routes relatives aux formations Fresq' },
          { name: 'Espaces', description: 'Routes relatives aux espaces' },
        ],
      },
    }),
  )
  .guard({
    response: {
      422: errorResponseSchema,
    },
  })
  .use(errorHandler)
  .get('/', () => ({
    service: 'Fresqviz API',
    version: '1.0.0',
    status: 'running',
  }))
  .get('/health', () => ({
    ok: true,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  }))
  .use(adminRoutes)
  .use(authRoutes)
  .use(invitationRoutes)
  .use(meRoutes)
  .use(programsRoutes)
  .use(sessionsRoutes)
  .use(workspacesRoutes);

export type App = typeof app;
