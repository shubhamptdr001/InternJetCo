/**
 * interview.test.js — Integration tests for /api/interviews/* routes
 */
import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import dotenv from 'dotenv';
import createApp from '../app.js';

dotenv.config();

const app = createApp();

let authCookie = '';
let interviewId = '';

// ─── Helper: register + login a fresh user ──────────────────────────────────
const loginTestUser = async () => {
  const email = `interview_test_${Date.now()}@internjetco.com`;
  await request(app).post('/api/auth/register').send({
    name: 'Interview Tester',
    email,
    password: 'Test@1234',
  });
  const res = await request(app).post('/api/auth/login').send({
    email,
    password: 'Test@1234',
  });
  const cookies = res.headers['set-cookie'];
  return cookies ? cookies.join('; ') : '';
};

// ─────────────────────────────────────────────────────────────────────────────

describe('Interview API', () => {

  beforeAll(async () => {
    authCookie = await loginTestUser();
  });

  // ─── Auth guard ────────────────────────────────────────────────
  describe('GET /api/interviews (unauthenticated)', () => {
    it('should return 401 without cookie', async () => {
      const res = await request(app).get('/api/interviews');
      expect(res.status).toBe(401);
    });
  });

  // ─── Start Interview ───────────────────────────────────────────
  describe('POST /api/interviews/start', () => {
    it('should start a new interview session', async () => {
      const res = await request(app)
        .post('/api/interviews/start')
        .set('Cookie', authCookie)
        .send({ role: 'Software Engineer', difficulty: 'medium' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.interview).toHaveProperty('_id');

      interviewId = res.body.interview._id;
    });

    it('should reject start without a role', async () => {
      const res = await request(app)
        .post('/api/interviews/start')
        .set('Cookie', authCookie)
        .send({});

      expect(res.status).toBe(400);
    });
  });

  // ─── List Interviews ───────────────────────────────────────────
  describe('GET /api/interviews', () => {
    it('should return a list of interviews for the user', async () => {
      const res = await request(app)
        .get('/api/interviews')
        .set('Cookie', authCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.interviews)).toBe(true);
    });
  });

  // ─── Get Single Interview ──────────────────────────────────────
  describe('GET /api/interviews/:id', () => {
    it('should return a single interview by ID', async () => {
      if (!interviewId) return; // skip if start failed
      const res = await request(app)
        .get(`/api/interviews/${interviewId}`)
        .set('Cookie', authCookie);

      expect(res.status).toBe(200);
      expect(res.body.interview._id).toBe(interviewId);
    });

    it('should return 404 for a non-existent interview ID', async () => {
      const res = await request(app)
        .get('/api/interviews/000000000000000000000000')
        .set('Cookie', authCookie);

      expect(res.status).toBe(404);
    });
  });

});
