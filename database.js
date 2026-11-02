import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { config } from './env.js';

let dbInstance = null;

/**
 * Initializes and returns the SQLite database connection.
 * @param {string} [customPath] - Optional custom path for test databases.
 * @returns {Database.Database}
 */
export function getDatabase(customPath) {
  if (dbInstance && !customPath) {
    return dbInstance;
  }

  const dbPath = customPath || config.dbPath;

  // If path is a file on disk (not in-memory), ensure the parent directory exists
  if (dbPath !== ':memory:') {
    const dbDir = path.dirname(path.resolve(dbPath));
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
  }

  const db = new Database(dbPath);

  // Enable foreign key constraints
  db.pragma('foreign_keys = ON');

  // Use Write-Ahead Logging for better concurrent read/write performance
  if (dbPath !== ':memory:') {
    db.pragma('journal_mode = WAL');
  }

  initSchema(db);

  if (!customPath) {
    dbInstance = db;
  }

  return db;
}

/**
 * Initializes the required database tables if they do not exist.
 * @param {Database.Database} db
 */
export function initSchema(db) {
  const schema = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      completed INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `;

  db.exec(schema);
}

/**
 * Closes the active database connection.
 */
export function closeDatabase() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
