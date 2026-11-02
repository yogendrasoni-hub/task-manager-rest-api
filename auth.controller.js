import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getDatabase } from '../config/database.js';
import { config } from '../config/env.js';

/**
 * Handle user registration.
 */
export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const db = getDatabase();

    // Check if email already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, config.bcryptRounds);

    // Insert new user into database
    const insertStmt = db.prepare(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)'
    );
    const result = insertStmt.run(name, email, passwordHash);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: Number(result.lastInsertRowid),
        name,
        email
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Handle user login.
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const db = getDatabase();

    // Look up user by email
    const user = db.prepare('SELECT id, name, email, password_hash FROM users WHERE email = ?').get(email);

    // Generic response if user not found to avoid account enumeration
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Verify password against stored bcrypt hash
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Sign JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    next(err);
  }
}
