import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { getDatabase } from '../config/database.js';

/**
 * Middleware to authenticate requests using JWT Bearer tokens.
 */
export function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Authorization token is required'
    });
  }

  const parts = authHeader.trim().split(/\s+/);
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      success: false,
      message: 'Authorization header must follow Bearer <token> format'
    });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret);

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload'
      });
    }

    // Verify user exists in SQLite
    const db = getDatabase();
    const user = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Authentication token has expired'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token'
    });
  }
}
