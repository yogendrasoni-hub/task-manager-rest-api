import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { getDatabase, closeDatabase } from '../src/config/database.js';
import { setupTestDatabase, cleanupTestDatabase } from './helpers.js';

describe('Database Persistence Verification', () => {
  beforeEach(() => {
    setupTestDatabase();
  });

  afterAll(() => {
    cleanupTestDatabase();
  });

  it('should persist user and task records across database connection restarts', () => {
    // 1. Initial connection: insert user and task
    const db1 = getDatabase();
    const userInsert = db1.prepare(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)'
    ).run('Persistence Tester', 'persist@example.com', 'hashed_pass_value');

    const userId = Number(userInsert.lastInsertRowid);

    const taskInsert = db1.prepare(
      'INSERT INTO tasks (user_id, title, description, completed) VALUES (?, ?, ?, ?)'
    ).run(userId, 'Persistent Task', 'Persists across restarts', 1);

    const taskId = Number(taskInsert.lastInsertRowid);

    // 2. Simulate server restart: close database connection
    closeDatabase();

    // 3. Re-initialize database connection (as happens during application restart)
    const db2 = getDatabase();

    // 4. Verify data survived the restart
    const persistedUser = db2.prepare('SELECT id, name, email FROM users WHERE id = ?').get(userId);
    expect(persistedUser).toBeDefined();
    expect(persistedUser.name).toBe('Persistence Tester');
    expect(persistedUser.email).toBe('persist@example.com');

    const persistedTask = db2.prepare('SELECT id, user_id, title, description, completed FROM tasks WHERE id = ?').get(taskId);
    expect(persistedTask).toBeDefined();
    expect(persistedTask.user_id).toBe(userId);
    expect(persistedTask.title).toBe('Persistent Task');
    expect(persistedTask.description).toBe('Persists across restarts');
    expect(persistedTask.completed).toBe(1);
  });
});
