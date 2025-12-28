// FILE: src/server.ts
// Server entry point

import app from './app';
import { env } from './config/env';
import prisma from './config/database';
import { logger, LogAction } from './utils/logger';
import { scheduledJobsService } from './services/scheduled-jobs.service';

const PORT = env.PORT;

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Initialize scheduled jobs
    scheduledJobsService.init();

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 PolyBookShop API server running on port ${PORT}`);
      console.log(`📚 Environment: ${env.NODE_ENV}`);
      console.log(`🌐 API URL: http://localhost:${PORT}${env.API_PREFIX}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      
      // Log system startup
      logger.info(LogAction.SYSTEM_STARTUP, {
        port: PORT,
        environment: env.NODE_ENV,
        timestamp: new Date().toISOString(),
      });
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    await logger.error(LogAction.SYSTEM_ERROR, {
      error: (error as Error).message,
      context: 'Server startup',
    });
    process.exit(1);
  }
}

// Graceful shutdown
// Only handle SIGINT/SIGTERM in production (VSCode terminal issues in dev)
if (env.NODE_ENV === 'production') {
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await logger.info(LogAction.SYSTEM_SHUTDOWN, {
      reason: 'SIGINT received',
      timestamp: new Date().toISOString(),
    });
    await prisma.$disconnect();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await logger.info(LogAction.SYSTEM_SHUTDOWN, {
      reason: 'SIGTERM received',
      timestamp: new Date().toISOString(),
    });
    await prisma.$disconnect();
    process.exit(0);
  });
}

startServer();
