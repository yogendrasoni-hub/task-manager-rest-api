import fs from 'fs';
import path from 'path';
import { getDatabase, closeDatabase } from '../src/config/database.js';
import { config } from '../src/config/env.js';

/**
 * Resets and clears the database for testing.
 */
export function setupTestDatabase() {
  const db = getDatabase();
  db.prepare('DELETE FROM tasks').run();
  db.prepare('DELETE FROM users').run();
  return db;
}

/**
 * Completely clean up test database files from disk.
 */
export function cleanupTestDatabase() {
  closeDatabase();
  const dbPath = config.dbPath;

  for (const ext of ['', '-shm', '-wal']) {
    const fullPath = path.resolve(dbPath + ext);
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
      } catch (err) {
        // Suppress transient lock errors during file unlink on Windows
      }
    }
  }
}
