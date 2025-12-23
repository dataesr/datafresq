import { serve } from 'bun';
import client from '@/index.html';
import { config } from '~/config';
import { close as closeDb, connect } from '~/database/mongo';
import { app } from '~/index';

async function bootstrap() {
  try {
    console.log('🔌 Connecting to database...');
    await connect();
    console.log('✅ Database connected');

    const server = serve({
      routes: {
        '/api/*': app.handle,
        '/*': client,
      },
      development: config.isDevelopment,
      hostname: '0.0.0.0',
      port: 3000,
      fetch(request) {
        console.log(`📥 Incoming request: ${request.method} ${request.url}`);
        return new Response('Route not matched', { status: 404 });
      },
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
