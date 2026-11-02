import app from './app.js';
import { config } from './config/env.js';
import { getDatabase, closeDatabase } from './config/database.js';

// Initialize the SQLite database connection and verify schemas
try {
  getDatabase();
  console.log(`[Database] SQLite database initialized at: ${config.dbPath}`);
} catch (err) {
  console.error('[Database Error] Failed to initialize SQLite database:', err.message);
  process.exit(1);
}

const server = app.listen(config.port, () => {
  console.log(`[Server] Task Manager REST API is running on http://localhost:${config.port}`);
  console.log(`[Server] Environment: ${config.nodeEnv}`);
});

// Graceful shutdown
function shutdown(signal) {
  console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('[Server] HTTP server closed.');
    closeDatabase();
    console.log('[Database] Database connection closed.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
