import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { setupTestDatabase, cleanupTestDatabase } from './helpers.js';

describe('Tasks API (/api/tasks)', () => {
  let userAToken;
  let userBToken;

  beforeEach(async () => {
    setupTestDatabase();

    // Register User A
    await request(app).post('/api/auth/register').send({
      name: 'User A',
      email: 'usera@example.com',
      password: 'Password123!'
    });

    const loginResA = await request(app).post('/api/auth/login').send({
      email: 'usera@example.com',
      password: 'Password123!'
    });
    userAToken = loginResA.body.token;

    // Register User B
    await request(app).post('/api/auth/register').send({
      name: 'User B',
      email: 'userb@example.com',
      password: 'Password123!'
    });

    const loginResB = await request(app).post('/api/auth/login').send({
      email: 'userb@example.com',
      password: 'Password123!'
    });
    userBToken = loginResB.body.token;
  });

  afterAll(() => {
    cleanupTestDatabase();
  });

  describe('POST /api/tasks', () => {
    it('should create a task successfully with HTTP 201', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: 'Complete ECE assignment',
          description: 'Finish the communication assignment',
          completed: false
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Task created successfully');
      expect(res.body.data).toMatchObject({
        id: expect.any(Number),
        title: 'Complete ECE assignment',
        description: 'Finish the communication assignment',
        completed: false
      });
      expect(res.body.data.created_at).toBeDefined();
      expect(res.body.data.updated_at).toBeDefined();
    });

    it('should default completed to false when omitted', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: 'Task without completed flag'
        });

      expect(res.status).toBe(201);
      expect(res.body.data.completed).toBe(false);
      expect(res.body.data.description).toBeNull();
    });

    it('should reject task creation when title is empty with HTTP 400', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: '   ',
          description: 'Valid description'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Validation failed');
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'title' })
        ])
      );
    });

    it('should reject task creation with unexpected extra fields with HTTP 400', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: 'Valid title',
          user_id: 9999 // Client attempting to tamper with ownership
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/tasks', () => {
    it('should return an empty array with HTTP 200 when user has no tasks', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    });

    it('should list all tasks belonging to the authenticated user', async () => {
      // Create 2 tasks for User A
      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ title: 'Task 1' });

      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ title: 'Task 2' });

      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
      expect(res.body.data.map(t => t.title)).toContain('Task 1');
      expect(res.body.data.map(t => t.title)).toContain('Task 2');
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should retrieve a single task by ID with HTTP 200', async () => {
      const created = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ title: 'Read Chapter 4' });

      const taskId = created.body.data.id;

      const res = await request(app)
        .get(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(taskId);
      expect(res.body.data.title).toBe('Read Chapter 4');
    });

    it('should return 400 for non-integer task ID', async () => {
      const res = await request(app)
        .get('/api/tasks/not-a-number')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 when task ID does not exist', async () => {
      const res = await request(app)
        .get('/api/tasks/999999')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Task not found');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update a task successfully with HTTP 200', async () => {
      const created = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ title: 'Initial Title', completed: false });

      const taskId = created.body.data.id;

      const res = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: 'Updated Title',
          description: 'Updated Description',
          completed: true
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Task updated successfully');
      expect(res.body.data.title).toBe('Updated Title');
      expect(res.body.data.description).toBe('Updated Description');
      expect(res.body.data.completed).toBe(true);
    });

    it('should reject an empty update body with HTTP 400', async () => {
      const created = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ title: 'Initial Title' });

      const taskId = created.body.data.id;

      const res = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject update with unknown fields with HTTP 400', async () => {
      const created = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ title: 'Initial Title' });

      const taskId = created.body.data.id;

      const res = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: 'Valid',
          random_field: 123
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return HTTP 404 when updating non-existent task', async () => {
      const res = await request(app)
        .put('/api/tasks/999999')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ title: 'Cannot Update Non-existent' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Task not found');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete a task successfully with HTTP 200', async () => {
      const created = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ title: 'Task to Delete' });

      const taskId = created.body.data.id;

      const res = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Task deleted successfully');

      // Verify task no longer exists
      const fetchRes = await request(app)
        .get(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(fetchRes.status).toBe(404);
    });

    it('should return HTTP 404 when deleting a non-existent task', async () => {
      const res = await request(app)
        .delete('/api/tasks/999999')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Task not found');
    });
  });

  describe('Multi-tenant Authorization & Isolation (User A vs User B)', () => {
    let userATaskId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          title: 'User A Confidential Task',
          description: 'Secrets belonging to User A',
          completed: false
        });

      userATaskId = res.body.data.id;
    });

    it('User B cannot see User A task in their task list', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });

    it('User B cannot retrieve User A task by ID (returns 404 Not Found)', async () => {
      const res = await request(app)
        .get(`/api/tasks/${userATaskId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Task not found');
    });

    it('User B cannot update User A task (returns 404 Not Found)', async () => {
      const res = await request(app)
        .put(`/api/tasks/${userATaskId}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .send({
          title: 'Hacked by User B'
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Task not found');

      // Verify User A task remains unchanged
      const checkRes = await request(app)
        .get(`/api/tasks/${userATaskId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(checkRes.body.data.title).toBe('User A Confidential Task');
    });

    it('User B cannot delete User A task (returns 404 Not Found)', async () => {
      const res = await request(app)
        .delete(`/api/tasks/${userATaskId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Task not found');

      // Verify User A task still exists
      const checkRes = await request(app)
        .get(`/api/tasks/${userATaskId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(checkRes.status).toBe(200);
    });
  });
});
