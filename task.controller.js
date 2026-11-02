import { getDatabase } from '../config/database.js';
import { formatTask } from '../utils/responses.js';

/**
 * Create a new task for the authenticated user.
 */
export async function createTask(req, res, next) {
  try {
    const { title, description = null, completed = false } = req.body;
    const userId = req.user.id;
    const db = getDatabase();

    const insertStmt = db.prepare(`
      INSERT INTO tasks (user_id, title, description, completed, created_at, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);

    const result = insertStmt.run(userId, title, description, completed ? 1 : 0);
    const createdTask = db.prepare(
      'SELECT id, user_id, title, description, completed, created_at, updated_at FROM tasks WHERE id = ?'
    ).get(result.lastInsertRowid);

    return res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: formatTask(createdTask)
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Retrieve all tasks for the authenticated user.
 */
export async function getAllTasks(req, res, next) {
  try {
    const userId = req.user.id;
    const db = getDatabase();

    const tasks = db.prepare(`
      SELECT id, user_id, title, description, completed, created_at, updated_at
      FROM tasks
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(userId);

    return res.status(200).json({
      success: true,
      message: 'Tasks retrieved successfully',
      data: tasks.map(formatTask)
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Retrieve a single task by ID for the authenticated user.
 */
export async function getTaskById(req, res, next) {
  try {
    const taskId = parseInt(req.params.id, 10);
    const userId = req.user.id;
    const db = getDatabase();

    const task = db.prepare(`
      SELECT id, user_id, title, description, completed, created_at, updated_at
      FROM tasks
      WHERE id = ? AND user_id = ?
    `).get(taskId, userId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Task retrieved successfully',
      data: formatTask(task)
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update an existing task belonging to the authenticated user.
 */
export async function updateTask(req, res, next) {
  try {
    const taskId = parseInt(req.params.id, 10);
    const userId = req.user.id;
    const db = getDatabase();

    // Verify task exists and belongs to the user
    const existingTask = db.prepare(
      'SELECT id FROM tasks WHERE id = ? AND user_id = ?'
    ).get(taskId, userId);

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const { title, description, completed } = req.body;
    const fieldsToUpdate = [];
    const values = [];

    if (title !== undefined) {
      fieldsToUpdate.push('title = ?');
      values.push(title);
    }

    if (description !== undefined) {
      fieldsToUpdate.push('description = ?');
      values.push(description);
    }

    if (completed !== undefined) {
      fieldsToUpdate.push('completed = ?');
      values.push(completed ? 1 : 0);
    }

    fieldsToUpdate.push('updated_at = CURRENT_TIMESTAMP');
    values.push(taskId, userId);

    const updateQuery = `
      UPDATE tasks
      SET ${fieldsToUpdate.join(', ')}
      WHERE id = ? AND user_id = ?
    `;

    db.prepare(updateQuery).run(...values);

    const updatedTask = db.prepare(
      'SELECT id, user_id, title, description, completed, created_at, updated_at FROM tasks WHERE id = ?'
    ).get(taskId);

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: formatTask(updatedTask)
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete a task belonging to the authenticated user.
 */
export async function deleteTask(req, res, next) {
  try {
    const taskId = parseInt(req.params.id, 10);
    const userId = req.user.id;
    const db = getDatabase();

    const deleteStmt = db.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?');
    const result = deleteStmt.run(taskId, userId);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (err) {
    next(err);
  }
}
