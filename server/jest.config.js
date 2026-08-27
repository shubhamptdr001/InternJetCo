/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.js'],
  transform: {},
  testMatch: ['**/tests/**/*.test.js'],
  globalSetup: './tests/globalSetup.js',
  globalTeardown: './tests/globalTeardown.js',
  collectCoverageFrom: [
    'controllers/**/*.js',
    'routes/**/*.js',
    'services/**/*.js',
    'middleware/**/*.js',
    '!**/node_modules/**',
  ],
  verbose: true,
  // Allow extra time for Gemini API calls in tests
  testTimeout: 30000,
};

export default config;
