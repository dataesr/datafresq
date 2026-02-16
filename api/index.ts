import { openapi } from '@elysiajs/openapi';
import { serverTiming } from '@elysiajs/server-timing';
import { Elysia } from 'elysia';
import { collections } from '~/database/mongo';
import { elastic } from '~/external/elastic';
import { errorHandler } from '~/plugins/error-handler';
import { adminRoutes } from '~/routes/admin';
import { authRoutes } from '~/routes/auth';
import { careersRoutes } from '~/routes/careers';
import { institutionsRoutes } from '~/routes/institutions';
import { programsRoutes } from '~/routes/programs';
import workspacesRoutes from '~/routes/workspaces';
import { logger } from './plugins/logger';
import { invitationRoutes } from './routes/invitations';
import { meRoutes } from './routes/me';
import { sessionsRoutes } from './routes/sessions';
import { usersRoutes } from './routes/users';
import { errorResponseSchema } from './schemas/common';
import { config } from './config';

export const app = new Elysia({ prefix: '/api' })
  .use(serverTiming({ enabled: !config.isProduction }))
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
  .get('/health', async ({ set }) => {
    const checks: Record<string, { ok: boolean; latencyMs?: number; error?: string }> = {};

    const mongoStart = performance.now();
    try {
      await collections.db.command({ ping: 1 });
      checks.mongodb = { ok: true, latencyMs: Math.round(performance.now() - mongoStart) };
    } catch (err) {
      console.error(err);
      checks.mongodb = {
        ok: false,
        latencyMs: Math.round(performance.now() - mongoStart),
        error: 'Mongodb failure',
      };
    }

    const esStart = performance.now();
    try {
      await elastic.client.ping();
      checks.elasticsearch = { ok: true, latencyMs: Math.round(performance.now() - esStart) };
    } catch (err) {
      console.error(err)
      checks.elasticsearch = {
        ok: false,
        latencyMs: Math.round(performance.now() - esStart),
        error: 'Elasticsearch failure',
      };
    }

    const allHealthy = Object.values(checks).every((c) => c.ok);
    if (!allHealthy) set.status = 503;

    return {
      ok: allHealthy,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      checks,
    };
  })
  .use(adminRoutes)
  .use(authRoutes)
  .use(careersRoutes)
  .use(institutionsRoutes)
  .use(invitationRoutes)
  .use(meRoutes)
  .use(programsRoutes)
  .use(sessionsRoutes)
  .use(usersRoutes)
  .use(workspacesRoutes);

export type App = typeof app;
