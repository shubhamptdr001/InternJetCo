import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { beforeAll, afterAll, afterEach } from '@jest/globals';
import { MongoMemoryServer } from 'mongodb-memory-server';

dotenv.config();

// Provide fallback environment variables for tests so they don't crash in CI 
// if GitHub Secrets are missing or empty.
process.env.JWT_SECRET = process.env.JWT_SECRET || 'fallback_test_jwt_secret_key_12345';
process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'fallback_gemini_api_key';

let mongoServer;

beforeAll(async () => {
  // If MONGODB_URI is provided (e.g. from Docker/service container in CI, or local test DB), connect directly
  if (process.env.MONGODB_URI) {
    await mongoose.connect(process.env.MONGODB_URI);
    return;
  }

  // Use MongoMemoryServer for tests when no external URI is provided
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
}, 60000);

afterEach(async () => {
  // We'll keep data between tests in the same suite for now, as existing tests 
  // might depend on state like the logged-in user or interview sessions.
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});
