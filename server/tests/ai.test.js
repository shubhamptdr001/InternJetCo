/**
 * ai.test.js — Integration tests for /api/ai/* routes
 * Gemini service is mocked so tests don't make real API calls or hit rate limits.
 */
import { describe, it, expect, beforeAll, jest } from '@jest/globals';
import request from 'supertest';
import dotenv from 'dotenv';

dotenv.config();

// ─── Mock Gemini service BEFORE importing app ─────────────────────────────────
// This prevents any real Gemini API calls during tests.
jest.unstable_mockModule('../services/geminiService.js', () => ({
  analyzeResumeText: jest.fn().mockResolvedValue({
    atsScore: 72,
    strengths: ['Strong JavaScript skills', 'Good project structure'],
    missingSkills: ['Docker', 'AWS'],
    analysisReasoning: 'The resume is solid but lacks DevOps exposure.',
    ambiguitiesAndSuggestions: [
      {
        original_text: 'Worked on various projects',
        issue_type: 'Vague Responsibility',
        reasoning: 'No specifics about scope or outcomes.',
        suggestion: 'Use the STAR method to quantify impact.',
      },
    ],
  }),
  analyzeResumePDF: jest.fn().mockResolvedValue({
    atsScore: 68,
    strengths: ['React experience', 'Team collaboration'],
    missingSkills: ['TypeScript', 'Testing'],
    analysisReasoning: 'PDF resume analyzed with fallback mock.',
    ambiguitiesAndSuggestions: [],
  }),
  analyzeResumeImage: jest.fn().mockResolvedValue({
    atsScore: 65,
    strengths: ['Good education background'],
    missingSkills: ['Node.js'],
    analysisReasoning: 'Image resume analyzed with fallback mock.',
    ambiguitiesAndSuggestions: [],
  }),
  generateInterviewQuestions: jest.fn().mockResolvedValue([
    'What is the difference between REST and GraphQL?',
    'Explain event loop in JavaScript.',
  ]),
  evaluateAnswer: jest.fn().mockResolvedValue({
    score: 8,
    feedback: 'Good answer with clear explanation.',
    improvements: ['Add more specific examples'],
  }),
  reviewCodeSolution: jest.fn().mockResolvedValue({
    score: 75,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    codeQuality: ['Good variable names', 'Could use more comments'],
    refactoredCode: '// refactored version here',
  }),
}));

// Also mock Cloudinary to avoid real uploads
jest.unstable_mockModule('../services/cloudinaryService.js', () => ({
  uploadResume: jest.fn().mockResolvedValue({
    secure_url: 'https://res.cloudinary.com/test/resumes/test.pdf',
    public_id: 'internjetco/resumes/test',
  }),
  uploadAvatar: jest.fn().mockResolvedValue({
    secure_url: 'https://res.cloudinary.com/test/avatars/test.jpg',
    public_id: 'internjetco/avatars/test',
  }),
  deleteFile: jest.fn().mockResolvedValue({ result: 'ok' }),
  default: {},
}));

// Import app AFTER mocks are registered
const { default: createApp } = await import('../app.js');
const app = createApp();

// ─── Sample resume text ──────────────────────────────────────────────────────
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
`.trim();

// ─── Helper: register + login ────────────────────────────────────────────────
let authCookie = '';

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

// ─────────────────────────────────────────────────────────────────────────────

describe('AI API', () => {

  beforeAll(async () => {
    authCookie = await loginTestUser();
  });

  // ─── Auth guard ────────────────────────────────────────────────
  it('POST /api/ai/resume-analyze — 401 without auth', async () => {
    const res = await request(app).post('/api/ai/resume-analyze').send({});
    expect(res.status).toBe(401);
  });

  // ─── Validation ────────────────────────────────────────────────
  it('POST /api/ai/resume-analyze — 400 when targetRole missing', async () => {
    const res = await request(app)
      .post('/api/ai/resume-analyze')
      .set('Cookie', authCookie)
      .send({ resumeText: SAMPLE_RESUME });
    expect(res.status).toBe(400);
  });

  it('POST /api/ai/resume-analyze — 400 when resume too short', async () => {
    const res = await request(app)
      .post('/api/ai/resume-analyze')
      .set('Cookie', authCookie)
      .send({ targetRole: 'Software Engineer', resumeText: 'too short' });
    expect(res.status).toBe(400);
  });

  // ─── Successful analysis ───────────────────────────────────────
  it('POST /api/ai/resume-analyze — 201 with valid text resume', async () => {
    const res = await request(app)
      .post('/api/ai/resume-analyze')
      .set('Cookie', authCookie)
      .send({ targetRole: 'Software Engineer', resumeText: SAMPLE_RESUME });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.report).toHaveProperty('score', 72);
    expect(res.body.report.details).toHaveProperty('strengths');
    expect(res.body.report.details).toHaveProperty('ambiguitiesAndSuggestions');
  });

  // ─── Reports ───────────────────────────────────────────────────
  it('GET /api/ai/reports — returns list', async () => {
    const res = await request(app)
      .get('/api/ai/reports')
      .set('Cookie', authCookie);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.reports)).toBe(true);
  });

  it('GET /api/ai/reports?type=resume — filters by type', async () => {
    const res = await request(app)
      .get('/api/ai/reports?type=resume')
      .set('Cookie', authCookie);
    expect(res.status).toBe(200);
    expect(res.body.reports.every((r) => r.type === 'resume')).toBe(true);
  });

  // ─── Code Review ──────────────────────────────────────────────
  it('POST /api/ai/code-review — 400 when fields missing', async () => {
    const res = await request(app)
      .post('/api/ai/code-review')
      .set('Cookie', authCookie)
      .send({});
    expect(res.status).toBe(400);
  });

});
