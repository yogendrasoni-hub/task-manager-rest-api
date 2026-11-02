import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { setupTestDatabase, cleanupTestDatabase } from './helpers.js';
import { getDatabase } from '../src/config/database.js';

describe('Authentication API (/api/auth)', () => {
  beforeEach(() => {
    setupTestDatabase();
  });

  afterAll(() => {
    cleanupTestDatabase();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully with HTTP 201', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Yogendra Soni',
          email: 'yogendra@example.com',
          password: 'StrongPass123!'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('User registered successfully');
      expect(res.body.data).toBeDefined();
      expect(res.body.data.id).toBeTypeOf('number');
      expect(res.body.data.name).toBe('Yogendra Soni');
      expect(res.body.data.email).toBe('yogendra@example.com');
      // Ensure password or password_hash is NEVER returned in response
      expect(res.body.data.password).toBeUndefined();
      expect(res.body.data.password_hash).toBeUndefined();

      // Verify directly in database that password was hashed
      const db = getDatabase();
      const row = db.prepare('SELECT * FROM users WHERE email = ?').get('yogendra@example.com');
      expect(row).toBeDefined();
      expect(row.password_hash).not.toBe('StrongPass123!');
      expect(row.password_hash.startsWith('$2')).toBe(true);
    });

    it('should reject registration when email format is invalid with HTTP 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Yogendra Soni',
          email: 'invalid-email-format',
          password: 'StrongPass123!'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Validation failed');
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'email' })
        ])
      );
    });

    it('should reject registration when password is less than 8 characters with HTTP 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Yogendra Soni',
          email: 'test@example.com',
          password: 'short'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Validation failed');
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'password' })
        ])
      );
    });

    it('should reject registration with empty name with HTTP 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: '   ',
          email: 'test@example.com',
          password: 'StrongPass123!'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'name' })
        ])
      );
    });

    it('should reject registration with extra unexpected fields with HTTP 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Yogendra Soni',
          email: 'test@example.com',
          password: 'StrongPass123!',
          role: 'admin'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject duplicate email registration with HTTP 409', async () => {
      const payload = {
        name: 'Yogendra Soni',
        email: 'duplicate@example.com',
        password: 'StrongPass123!'
      };

      // First registration
      const res1 = await request(app).post('/api/auth/register').send(payload);
      expect(res1.status).toBe(201);

      // Duplicate registration attempt
      const res2 = await request(app).post('/api/auth/register').send(payload);
      expect(res2.status).toBe(409);
      expect(res2.body.success).toBe(false);
      expect(res2.body.message).toBe('Email already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send({
        name: 'Yogendra Soni',
        email: 'yogendra@example.com',
        password: 'StrongPass123!'
      });
    });

    it('should log in successfully with valid credentials and return HTTP 200 with JWT', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'yogendra@example.com',
          password: 'StrongPass123!'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Login successful');
      expect(res.body.token).toBeTypeOf('string');
      expect(res.body.token.split('.').length).toBe(3); // JWT format
      expect(res.body.user).toEqual({
        id: expect.any(Number),
        name: 'Yogendra Soni',
        email: 'yogendra@example.com'
      });
    });

    it('should reject login with wrong password with HTTP 401 and generic message', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'yogendra@example.com',
          password: 'WrongPassword999!'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid email or password');
      expect(res.body.token).toBeUndefined();
    });

    it('should reject login for non-existent email with HTTP 401 and generic message', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'unknown@example.com',
          password: 'StrongPass123!'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid email or password');
      expect(res.body.token).toBeUndefined();
    });

    it('should reject login when fields are missing with HTTP 400', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'yogendra@example.com'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Authentication Middleware Protection', () => {
    it('should reject protected route request when Authorization header is missing with HTTP 401', async () => {
      const res = await request(app).get('/api/tasks');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Authorization token is required');
    });

    it('should reject malformed Authorization header with HTTP 401', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', 'Basic 123456');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Authorization header must follow Bearer <token> format');
    });

    it('should reject invalid or forged JWT token with HTTP 401', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', 'Bearer invalid.token.payload');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid authentication token');
    });
  });
});
