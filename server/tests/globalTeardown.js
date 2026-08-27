// globalTeardown.js — runs ONCE after all test suites complete
// Drops the test database and closes the connection

export default async function globalTeardown() {
  if (globalThis.__MONGOOSE__) {
    await globalThis.__MONGOOSE__.connection.dropDatabase();
    await globalThis.__MONGOOSE__.connection.close();
    console.log('\n🧹 Test DB dropped and connection closed.');
  }
}
