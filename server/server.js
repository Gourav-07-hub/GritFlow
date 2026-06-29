/**
 * server.js — Express application entry point
 * GritFlow API Server
 *
 * Boot order:
 *   1. Load environment variables (dotenv)
 *   2. Register process-level error handlers
 *   3. Connect to MongoDB (await — server does NOT start on DB failure)
 *   4. Configure Express middleware & routes
 *   5. Start listening
 */

// ─── Environment ──────────────────────────────────────────────────────────────
// dotenv MUST be called before any other import that reads process.env
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import habitRoutes from './routes/habitRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import reflectionRoutes from './routes/reflectionRoutes.js';
import focusRoutes from './routes/focusRoutes.js';
import gratitudeRoutes from './routes/gratitudeRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import achievementRoutes from './routes/achievementRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import friendRoutes from './routes/friendRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { socketHandler } from './socket/socketHandler.js';
import compression from 'compression';
import { generalLimiter, authLimiter, focusLimiter } from './middleware/rateLimitMiddleware.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import path from 'path';
import { fileURLToPath } from 'url';

// ─── Process-level Error Handlers ─────────────────────────────────────────────

/**
 * Catch synchronous exceptions that escape all try/catch blocks.
 * Log the error and exit so the process supervisor can restart cleanly.
 */
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err.message);
  console.error(err.stack);
  process.exit(1);
});

/**
 * Catch unhandled Promise rejections (e.g. a forgotten await).
 * In Node 15+ these crash the process by default; we handle them explicitly.
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise);
  console.error('   Reason:', reason);
  process.exit(1);
});

// ─── App Initialisation ───────────────────────────────────────────────────────

/**
 * Async init function — ensures the DB is connected before the HTTP server
 * starts listening. If connectDB() throws, the process exits via its own
 * error handler and the app.listen() call is never reached.
 */
const initServer = async () => {
  // 1. Connect to MongoDB first — exit on failure
  await connectDB();

  // 2. Create Express app
  const app = express();
  const PORT = process.env.PORT || 5000;
  const NODE_ENV = process.env.NODE_ENV || 'development';

  // ─── CORS — must come before everything ──────────────────────────────────────
  const clientOrigins = (process.env.CLIENT_ORIGIN || '').split(',').filter(Boolean);
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://gritflow-eight.vercel.app',
    'https://gritflow-bebkkui2o-gorsh-07.vercel.app',
    ...clientOrigins
  ];
  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
    })
  );

  // ─── Security & Performance Middleware ─────────────────────────────────────────
  app.use(helmet());
  app.use(compression());

  // ─── Body Parsers — limits set high so multipart isn't blocked ─────────────
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Rate Limiting — must be applied before routing
  app.use('/api/auth', authLimiter);
  app.use('/api/focus/sessions', focusLimiter);

  // ─── Static files (local avatar uploads) ────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Routes ─────────────────────────────────────────────────────────────────

  // Authentication — POST /api/auth/register, POST /api/auth/login
  app.use('/api/auth', authRoutes);

  // Habits Tracker — CRUD and toggles
  app.use('/api/habits', habitRoutes);

  // Goals Tracker — CRUD, progress and milestones
  app.use('/api/goals', goalRoutes);

  // Reflection Journal — CRUD, dates, stats
  app.use('/api/reflections', reflectionRoutes);

  // Focus Timer — CRUD, stats, settings
  app.use('/api/focus', focusRoutes);

  // Gratitude Journal — CRUD, stats, favorites
  app.use('/api/gratitude', gratitudeRoutes);

  // Statistics Dashboard — Overview, heatmap, reports
  app.use('/api/stats', statsRoutes);

  // User Settings — Profile, Preferences, Account deletion
  app.use('/api/settings', settingsRoutes);

  // Achievements & Notifications
  app.use('/api/achievements', achievementRoutes);
  app.use('/api/notifications', notificationRoutes);

  // Friends Feature
  app.use('/api/friends', friendRoutes);

  // Chat Feature
  app.use('/api/chat', chatRoutes);

  // Health check — GET /api/health
  app.use('/api/health', healthRoutes);

  // 404 handler for any unmatched routes
  app.use(notFound);

  // ─── Global Error Handler ────────────────────────────────────────────────────
  // Must be registered AFTER all other app.use() calls
  app.use(errorHandler);

  // Create HTTP Server and Socket.io Server
  const httpServer = createServer(app);

  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  socketHandler(io);

  // ─── Start Listening ─────────────────────────────────────────────────────────
  const server = httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Graceful shutdown — close DB connection when the process terminates
  const shutdown = async (signal) => {
    console.log(`\n🛑 ${signal} received — shutting down gracefully...`);
    server.close(async () => {
      const mongoose = (await import('mongoose')).default;
      await mongoose.connection.close();
      console.log('   MongoDB connection closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  return app; // Exported for testing
};

// Run the initialisation
const app = await initServer();

export default app;
