import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';

import { connectDatabase } from './config/db.js';
import { errorHandler, notFound } from './middleware/error.js';
import authRoutes from './routes/authRoutes.js';
import weddingRoutes from './routes/weddingRoutes.js';
import functionRoutes from './routes/functionRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import planRoutes from './routes/planRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import editorRoutes from './routes/editorRoutes.js';

// ---------------------------------------------------------------------------
// 1. Validate required environment variables at startup (fail fast)
// ---------------------------------------------------------------------------
const REQUIRED_ENV = ['JWT_SECRET', 'MONGODB_URI'];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length) {
  process.stderr.write(`FATAL: Missing required environment variables: ${missing.join(', ')}\n`);
  process.exit(1);
}
if (process.env.JWT_SECRET === 'weddingai_super_secret_jwt_key_2026_change_in_prod') {
  process.stderr.write('WARNING: JWT_SECRET is using the default insecure value. Change it in production.\n');
}

const isDev = process.env.NODE_ENV !== 'production';

// ---------------------------------------------------------------------------
// 2. Express app & Proxy setup
// ---------------------------------------------------------------------------
const app = express();

// Trust reverse proxy headers (essential for Render, Vercel, Heroku, AWS ELB rate-limiting)
app.set('trust proxy', 1);

// Security headers
app.use(helmet());

// Dynamic CORS configuration (supports local dev, specific frontend URLs, and Vercel domains)
const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((o) => o.trim().replace(/\/+$/, ''))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman, server-to-server)
      if (!origin) return callback(null, true);

      // In local dev, allow all origins
      if (isDev) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/+$/, '');

      // Check against explicit whitelist
      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      // Allow Vercel preview & production deployments (*.vercel.app)
      if (/^https:\/\/.*\.vercel\.app$/.test(normalizedOrigin)) {
        return callback(null, true);
      }

      // Allow localhost in production testing
      if (/^http:\/\/localhost(:\d+)?$/.test(normalizedOrigin)) {
        return callback(null, true);
      }

      callback(null, true); // Permissive fallback to prevent breaking deployments
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Body parsing
app.use(express.json({ limit: '1mb' }));

// Logging
app.use(morgan(isDev ? 'dev' : 'combined'));

// ---------------------------------------------------------------------------
// 3. Rate limiting
// ---------------------------------------------------------------------------

/** Global: 300 requests per 15 minutes per IP */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again later.' },
});

/** Auth endpoints: 15 attempts per 15 minutes per IP */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please wait 15 minutes and try again.' },
});

/** AI generation: 10 generations per minute per IP */
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'AI generation rate limit reached. Please wait a moment.' },
});

app.use(globalLimiter);

// ---------------------------------------------------------------------------
// 4. Health check & Root routes (Render health monitoring)
// ---------------------------------------------------------------------------
app.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'WeddingAI Backend API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    documentation: 'https://github.com/MridulMalvi/AI-Driven-Wedding-Album-Video-Planning-System',
  });
});

app.get('/health', (_req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbOk = dbState === 1 || dbState === 2;
  res.status(dbOk ? 200 : 503).json({
    status: dbOk ? 'healthy' : 'degraded',
    db: dbOk ? 'connected' : 'disconnected',
    aiProvider: process.env.AI_PROVIDER || 'mock',
    env: process.env.NODE_ENV || 'development',
  });
});

app.get('/api/health', (_req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbOk = dbState === 1 || dbState === 2;
  res.status(dbOk ? 200 : 503).json({
    ok: dbOk,
    db: dbOk ? 'connected' : 'disconnected',
    aiProvider: process.env.AI_PROVIDER || 'mock',
    env: process.env.NODE_ENV || 'development',
  });
});

// ---------------------------------------------------------------------------
// 5. Application API Routes
// ---------------------------------------------------------------------------
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/weddings', weddingRoutes);
app.use('/api/functions', functionRoutes);
app.use('/api/ai', aiLimiter, aiRoutes);
app.use('/api', planRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/editor', editorRoutes);

app.use(notFound);
app.use(errorHandler);

// ---------------------------------------------------------------------------
// 6. Start server + graceful shutdown
// ---------------------------------------------------------------------------
const port = Number(process.env.PORT) || 5000;

connectDatabase()
  .then(() => {
    const server = app.listen(port, '0.0.0.0', () => {
      process.stdout.write(`WeddingAI API listening on port ${port} [${process.env.NODE_ENV || 'development'}]\n`);
    });

    const shutdown = (signal) => {
      process.stdout.write(`\n${signal} received — shutting down gracefully...\n`);
      server.close(async () => {
        try {
          await mongoose.connection.close();
          process.stdout.write('MongoDB connection closed. Goodbye.\n');
        } catch (_) { /* ignore */ }
        process.exit(0);
      });

      setTimeout(() => {
        process.stderr.write('Graceful shutdown timed out — forcing exit.\n');
        process.exit(1);
      }, 10_000).unref();
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  })
  .catch((err) => {
    process.stderr.write(`Database connection failed: ${err.message}\n`);
    process.exit(1);
  });

export default app;
