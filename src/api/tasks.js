import { apiRequest } from './client.js';

/**
 * Get all tasks for the authenticated user.
 */
export async function getTasks() {
  const res = await apiRequest('/tasks', { method: 'GET' });
  return res.data || [];
}

/**
 * Get a single task by ID.
 * @param {number|string} id
 */
export async function getTaskById(id) {
  const res = await apiRequest(`/tasks/${id}`, { method: 'GET' });
  return res.data;
}

/**
 * Create a new task.
 * @param {{ title: string, description?: string, completed?: boolean }} taskData
 */
export async function createTask(taskData) {
  // Clean payload to satisfy backend Zod strict schema
  const payload = {
    title: taskData.title.trim(),
    description: taskData.description && taskData.description.trim() ? taskData.description.trim() : null,
    completed: Boolean(taskData.completed)
  };

  const res = await apiRequest('/tasks', {
    method: 'POST',
    body: payload
  });
  return res.data;
}

/**
 * Update an existing task.
 * @param {number|string} id
 * @param {{ title?: string, description?: string, completed?: boolean }} updates
 */
export async function updateTask(id, updates) {
  const payload = {};

  if (updates.title !== undefined) {
    payload.title = updates.title.trim();
  }
  if (updates.description !== undefined) {
    payload.description = updates.description && updates.description.trim() ? updates.description.trim() : null;
  }
  if (updates.completed !== undefined) {
    payload.completed = Boolean(updates.completed);
  }

  const res = await apiRequest(`/tasks/${id}`, {
    method: 'PUT',
    body: payload
  });
  return res.data;
}

/**
 * Delete a task by ID.
 * @param {number|string} id
 */
export async function deleteTask(id) {
  return await apiRequest(`/tasks/${id}`, {
    method: 'DELETE'
  });
}
