import { AppError } from '../utils/responses.js';

/**
 * Centralized error handling middleware.
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  // 1. JSON parsing errors (e.g., malformed JSON body)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON payload in request body'
    });
  }

  // 2. Custom AppError instances
  if (err instanceof AppError) {
    const response = {
      success: false,
      message: err.message
    };

    if (err.errors) {
      response.errors = err.errors;
    }

    return res.status(err.statusCode).json(response);
  }

  // 3. SQLite Constraint Violations
  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE' || (err.message && err.message.includes('UNIQUE constraint failed'))) {
    return res.status(409).json({
      success: false,
      message: 'Email already exists'
    });
  }

  if (err.code && err.code.startsWith('SQLITE_')) {
    // Log internally, do not leak database specifics
    console.error(`[SQLite Error] ${err.code}: ${err.message}`);
    return res.status(500).json({
      success: false,
      message: 'Database operation failed'
    });
  }

  // 4. Fallback for unexpected errors
  console.error('[Unhandled Server Error]', err);
  return res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
}

/**
 * 404 handler for undefined routes.
 */
export function notFoundHandler(req, res) {
  return res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
}
