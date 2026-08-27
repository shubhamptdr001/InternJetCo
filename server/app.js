import express from 'express';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import errorHandler from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import interviewRoutes from './routes/interviewRoutes.js';
import peerInterviewRoutes from './routes/peerInterviewRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import userRoutes from './routes/userRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import socketHandler from './sockets/socketHandler.js';

/**
 * Creates and configures the Express app + Socket.io server.
 * Exported separately from server.js so that tests can import the app
 * without binding to a port.
 */
const createApp = () => {
  const app = express();

  // --------------- Middleware ---------------
  app.use(helmet());
  app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // --------------- Health Check ---------------
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      message: 'InternJetCo API is running 🚀',
      timestamp: new Date().toISOString(),
    });
  });

  // --------------- Routes ---------------
  app.use('/api/auth', authRoutes);
  app.use('/api/interviews', interviewRoutes);
  app.use('/api/peer-interviews', peerInterviewRoutes);
  app.use('/api/feedback', feedbackRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/ai', aiRoutes);

  // --------------- Error Handler (must be last) ---------------
  app.use(errorHandler);

  return app;
};

export default createApp;
