import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import createApp from './app.js';
import socketHandler from './sockets/socketHandler.js';

dotenv.config();

// ─── Connect to MongoDB ───
connectDB();

const app = createApp();
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  },
});

socketHandler(io);

// --------------- Start Server ---------------
server.listen(PORT, () => {
  console.log(`\n🚀 InternJetCo API + Socket.io running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health\n`);
});
