import app from './app.js';
import { getDbPool } from './config/database.js';

const PORT = parseInt(process.env.PORT, 10) || 5000;

async function startServer() {
  try {
    // Test database connection at startup
    await getDbPool();
    console.log('[Server] Database connection verified.');

    const server = app.listen(PORT, () => {
      console.log(`[Server] Travel-Doc REST API server listening on http://localhost:${PORT}`);
      console.log(`[Server] Health check available at http://localhost:${PORT}/api/v1/health`);
    });

    // Graceful shutdown
    const handleShutdown = async (signal) => {
      console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        console.log('[Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => handleShutdown('SIGINT'));
    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  } catch (err) {
    console.error('[Server] Fatal startup error:', err.message);
    process.exit(1);
  }
}

startServer();
