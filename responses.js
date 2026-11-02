/**
 * Formats a SQLite task row into the API response format.
 * Converts integer completed (0/1) to boolean.
 * @param {object} row
 * @returns {object|null}
 */
export function formatTask(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? null,
    completed: Boolean(row.completed),
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

/**
 * Standard success response helper.
 */
export function sendSuccess(res, statusCode, message, data) {
  const payload = {
    success: true,
    message
  };

  if (data !== undefined) {
    payload.data = data;
  }

  return res.status(statusCode).json(payload);
}

/**
 * Custom application error class.
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, errors = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}
