import Elysia from 'elysia';
import { elastic } from '~/database/elastic';

import { collections } from '~/database/mongo';
import { authMacro } from '~/macros/authMacro';

export const systemRoutes = new Elysia({ name: 'system' })
  .use(authMacro)
  .guard({
    allow: 'visitor',
    detail: { tags: ['Système'] },
  })
  .get('/', () => ({
    service: 'dataFRESQ API',
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
      await elastic.ping();
      checks.elasticsearch = { ok: true, latencyMs: Math.round(performance.now() - esStart) };
    } catch (err) {
      console.error(err);
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
  });
