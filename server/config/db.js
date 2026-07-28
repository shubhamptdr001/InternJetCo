import mongoose from 'mongoose';

// ─── Connection Options ───────────────────────────────────────────────────────
// serverSelectionTimeoutMS: stop waiting for Atlas to wake up after 10s
// heartbeatFrequencyMS: how often mongoose pings Atlas to keep the connection alive
// socketTimeoutMS: abort a hung socket after 45s
const MONGO_OPTIONS = {
  serverSelectionTimeoutMS: 10000,
  heartbeatFrequencyMS: 30000,   // ping Atlas every 30s — keeps free cluster from going idle
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
};

let retryCount = 0;
const MAX_RETRIES = 5;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, MONGO_OPTIONS);
    retryCount = 0; // reset on success
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);

    // ─── Keep-Alive Ping ───────────────────────────────────────────────────
    // Pings MongoDB every 5 minutes so Atlas doesn't consider the connection idle.
    // This is the key fix for free-tier clusters that pause after inactivity.
    setInterval(async () => {
      try {
        await mongoose.connection.db.admin().ping();
      } catch (_err) {
        // ping failed silently — mongoose will auto-reconnect via heartbeat
      }
    }, 5 * 60 * 1000); // every 5 minutes

  } catch (error) {
    retryCount++;
    console.error(`❌ MongoDB connection error (attempt ${retryCount}): ${error.message}`);

    if (retryCount < MAX_RETRIES) {
      const delay = Math.min(1000 * Math.pow(2, retryCount), 30000); // exponential backoff, max 30s
      console.log(`🔄 Retrying in ${delay / 1000}s...`);
      setTimeout(connectDB, delay);
    } else {
      console.error('⚠️  Max retries reached. Server running without DB — DB routes will fail.');
    }
  }
};

// ─── Mongoose Event Listeners ────────────────────────────────────────────────
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected. Auto-reconnect in progress...');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected.');
});

export default connectDB;
