import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { beforeAll, afterAll, afterEach } from '@jest/globals';

dotenv.config();

beforeAll(async () => {
  // Use a separate test database
  const testUri = process.env.MONGODB_URI_TEST || process.env.MONGODB_URI.replace(
    /\/internjetco(\?|$)/,
    '/internjetco_test$1'
  );
  
  await mongoose.connect(testUri);
});

afterEach(async () => {
  // Clear all collections after each test suite (or each test if preferred, but tests might rely on state)
  // Actually, let's keep data between tests in the same file, but clear after all tests in the file
});

afterAll(async () => {
  // Drop DB and close connection after tests in the current worker finish
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
});
