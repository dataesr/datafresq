import { cors } from '@elysiajs/cors';
import { openapi } from '@elysiajs/openapi';
import { serverTiming } from '@elysiajs/server-timing';
import { Elysia } from 'elysia';

import { config } from '~/config';
import { errorHandler } from '~/plugins/error-handler';
import { logger } from '~/plugins/logger';

import { adminRoutes } from '~/routes/admin';
import { authRoutes } from '~/routes/auth';
import { careersRoutes } from '~/routes/careers';
import { guideRoutes } from '~/routes/guide';
import { institutionsRoutes } from '~/routes/institutions';
import { meRoutes } from '~/routes/me';
import { programsRoutes } from '~/routes/programs';
import { sessionsRoutes } from '~/routes/sessions';
import { systemRoutes } from '~/routes/system';
import { usersRoutes } from '~/routes/users';
import { workspacesRoutes } from '~/routes/workspaces';

import { errorResponseSchema } from '~/schemas/common';

export const app = new Elysia({ prefix: '/api' })
  .use(cors({ credentials: true }))
  .use(serverTiming({ enabled: !config.isProduction }))
  .use(logger())
  .use(
    openapi({
      documentation: {
        info: {
          title: 'dataFRESQ',
          version: '1.0.0',
          description: 'API documentation for Fresqviz application',
        },
      },
    }),
  )
  .guard({
    response: {
      422: errorResponseSchema,
      500: errorResponseSchema,
    },
  })
  .use(errorHandler)
  .use(adminRoutes)
  .use(authRoutes)
  .use(careersRoutes)
  .use(guideRoutes)
  .use(institutionsRoutes)
  .use(meRoutes)
  .use(programsRoutes)
  .use(sessionsRoutes)
  .use(systemRoutes)
  .use(usersRoutes)
  .use(workspacesRoutes);

export type App = typeof app;
