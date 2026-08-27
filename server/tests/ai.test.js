/**
 * ai.test.js — Integration tests for /api/ai/* routes
 * Tests resume analysis and code review endpoints.
 * Note: These tests do NOT call the real Gemini API — the fallback
 * is triggered when the API key is unavailable or the model times out.
 */
import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import dotenv from 'dotenv';
import createApp from '../app.js';

dotenv.config();

const app = createApp();

let authCookie = '';

// ─── Helper ──────────────────────────────────────────────────────────────────
const loginTestUser = async () => {
  const email = `ai_test_${Date.now()}@internjetco.com`;
  await request(app).post('/api/auth/register').send({
    name: 'AI Tester',
    email,
    password: 'Test@1234',
  });
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email, password: 'Test@1234' });
  const cookies = res.headers['set-cookie'];
  return cookies ? cookies.join('; ') : '';
};

const SAMPLE_RESUME = `
John Doe — Software Engineer
Email: john@example.com | GitHub: github.com/johndoe

EXPERIENCE
Software Engineer at Acme Corp (2021–2024)
- Worked on various projects using React and Node.js
- Responsible for improving performance of the backend API
- Familiar with Agile methodologies and team collaboration

EDUCATION
B.Tech Computer Science — ABC University (2021)

SKILLS
JavaScript, React, Node.js, MongoDB, Express, Git
`;

// ─────────────────────────────────────────────────────────────────────────────

describe('AI API', () => {

  beforeAll(async () => {
    authCookie = await loginTestUser();
  });

  // ─── Auth guard ────────────────────────────────────────────────
  describe('POST /api/ai/resume-analyze (unauthenticated)', () => {
    it('should return 401 without cookie', async () => {
      const res = await request(app).post('/api/ai/resume-analyze').send({});
      expect(res.status).toBe(401);
    });
  });

  // ─── Resume Analyze ───────────────────────────────────────────
  describe('POST /api/ai/resume-analyze (text)', () => {
    it('should analyze resume text and return a report', async () => {
      const res = await request(app)
        .post('/api/ai/resume-analyze')
        .set('Cookie', authCookie)
        .send({ targetRole: 'Software Engineer', resumeText: SAMPLE_RESUME });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.report).toHaveProperty('score');
      expect(res.body.report).toHaveProperty('details');
    }, 30000); // Allow 30s for Gemini or fallback

    it('should reject when targetRole is missing', async () => {
      const res = await request(app)
        .post('/api/ai/resume-analyze')
        .set('Cookie', authCookie)
        .send({ resumeText: SAMPLE_RESUME });

      expect(res.status).toBe(400);
    });

    it('should reject when resume content is too short', async () => {
      const res = await request(app)
        .post('/api/ai/resume-analyze')
        .set('Cookie', authCookie)
        .send({ targetRole: 'Software Engineer', resumeText: 'too short' });

      expect(res.status).toBe(400);
    });
  });

  // ─── AI Reports ────────────────────────────────────────────────
  describe('GET /api/ai/reports', () => {
    it('should return a list of AI reports for the user', async () => {
      const res = await request(app)
        .get('/api/ai/reports')
        .set('Cookie', authCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.reports)).toBe(true);
    });

    it('should filter reports by type', async () => {
      const res = await request(app)
        .get('/api/ai/reports?type=resume')
        .set('Cookie', authCookie);

      expect(res.status).toBe(200);
      expect(res.body.reports.every((r) => r.type === 'resume')).toBe(true);
    });
  });

  // ─── Code Review ──────────────────────────────────────────────
  describe('POST /api/ai/code-review', () => {
    it('should reject when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/ai/code-review')
        .set('Cookie', authCookie)
        .send({});

      expect(res.status).toBe(400);
    });
  });

});
