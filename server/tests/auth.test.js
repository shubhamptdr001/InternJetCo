/**
 * auth.test.js — Integration tests for /api/auth/* routes
 * Uses Supertest to make real HTTP requests against the Express app.
 */
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import createApp from '../app.js';

dotenv.config();

const app = createApp();

// Shared state across tests
let authCookie = '';
const testUser = {
  name: 'Test User',
  email: `test_${Date.now()}@internjetco.com`,
  password: 'Test@1234',
};

// ─────────────────────────────────────────────────────────────────────────────

describe('Auth API', () => {

  // ─── Health Check ──────────────────────────────────────────────
  describe('GET /api/health', () => {
    it('should return 200 with status ok', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });

  // ─── Register ──────────────────────────────────────────────────
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toHaveProperty('email', testUser.email);
    });

    it('should reject duplicate email registration', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject registration with missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'nope@test.com' });

      expect(res.status).toBe(400);
    });
  });

  // ─── Login ─────────────────────────────────────────────────────
  describe('POST /api/auth/login', () => {
    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Capture the auth cookie for subsequent tests
      const cookies = res.headers['set-cookie'];
      if (cookies) authCookie = cookies.join('; ');
    });

    it('should reject wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: 'WrongPassword!' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@nowhere.com', password: 'Test@1234' });

      expect(res.status).toBe(401);
    });
  });

  // ─── Protected Profile ─────────────────────────────────────────
  describe('GET /api/auth/profile', () => {
    it('should return profile when authenticated', async () => {
      const res = await request(app)
        .get('/api/auth/profile')
        .set('Cookie', authCookie);

      expect(res.status).toBe(200);
      expect(res.body.user).toHaveProperty('email', testUser.email);
    });

    it('should return 401 when not authenticated', async () => {
      const res = await request(app).get('/api/auth/profile');
      expect(res.status).toBe(401);
    });
  });

  // ─── Logout ────────────────────────────────────────────────────
  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', authCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

});
