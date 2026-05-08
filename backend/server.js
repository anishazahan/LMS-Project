import app from './src/app.js';
import { env } from './src/config/env.js';
import { connectDB, disconnectDB } from './src/config/db.js';
import { logger } from './src/config/logger.js';

const start = async () => {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 Server listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
    logger.info(`API prefix: ${env.API_PREFIX}`);
  });

  const shutdown = (signal) => async () => {
    logger.info(`${signal} received — shutting down gracefully`);
    server.close(async () => {
      await disconnectDB();
      logger.info('Server closed');
      process.exit(0);
    });
    setTimeout(() => {
      logger.error('Forced shutdown after 10s');
      process.exit(1);
    }, 10_000).unref();
  };

  process.on('SIGTERM', shutdown('SIGTERM'));
  process.on('SIGINT', shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error(`Unhandled rejection: ${reason?.stack || reason}`);
  });
  process.on('uncaughtException', (err) => {
    logger.error(`Uncaught exception: ${err.stack}`);
    process.exit(1);
  });
};

start().catch((err) => {
  logger.error(`Bootstrap failed: ${err.stack || err.message}`);
  process.exit(1);
});
