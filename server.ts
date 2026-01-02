import { file, serve } from 'bun';
import client from '@/index.html';
import { config } from '~/config';
import { close as closeDb, connect } from '~/database/mongo';
import { app } from '~/index';

async function bootstrap() {
  try {
    await connect();

    const server = serve({
      routes: {
        '/api/*': app.handle,
        '/public/*': async (req) => {
          const url = new URL(req.url);
          const filePath = `./public${url.pathname.slice(7)}`;
          const f = file(filePath);
          if (await f.exists()) {
            return new Response(f);
          }
          return new Response('Not found', { status: 404 });
        },
        '/*': client,
      },
      development: config.isDevelopment,
      port: 3000,
      idleTimeout: 60, // 1 minutes - allows longer requests for exports
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
