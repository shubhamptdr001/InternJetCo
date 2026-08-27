// globalSetup.js — runs ONCE before all test suites
// Connects to a separate test MongoDB database

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export default async function globalSetup() {
  const testUri = process.env.MONGODB_URI_TEST || process.env.MONGODB_URI.replace(
    /\/internjetco(\?|$)/,
    '/internjetco_test$1'
  );

  await mongoose.connect(testUri);
  console.log('\n✅ Test DB connected:', testUri.split('@')[1]?.split('/')[0]);

  // Store the connection so globalTeardown can close it
  globalThis.__MONGOOSE__ = mongoose;
}
