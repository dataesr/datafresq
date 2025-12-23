import { serve } from 'bun';
import Elysia from 'elysia';
import client from '@/index.html';
import { config } from '~/config';
import { close as closeDb, connect } from '~/database/mongo';
import { app } from '~/index';

async function bootstrap() {
  try {
    await connect();

    const server = serve({
      routes: {
        '/*': client,
        '/api/*': async (req) => new Elysia({ prefix: '/api' }).use(app).handle(req),
      },
      development: config.isDevelopment,
    });

    console.log(`

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    🚀 Server Running

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    📊 Environment: ${config.nodeEnv}

    🌐 Web Client: ${server.url}

    📚 API Docs: ${server.url}api/openapi

    ✅ Ready to accept requests!

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

    return server;
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

async function shutdown() {
  console.log('\n🛑 Shutting down gracefully...');
  try {
    await closeDb();
    console.log('👋 Shutdown complete');
  } catch (err) {
    console.error('Error during shutdown:', err);
  }
  process.exit(0);
}

process.removeAllListeners('SIGINT');
process.removeAllListeners('SIGTERM');
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

bootstrap();
