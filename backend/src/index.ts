import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes';
import workoutRoutes from './routes/workoutRoutes';
import statsRoutes from './routes/statsRoutes';
import syncRoutes from './routes/syncRoutes';

import { logger, initCrashTracking } from './services/logger';
import { prisma } from './services/db';

// Load environment variables
dotenv.config();

// Initialize Crash & Exception Tracking
initCrashTracking();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust First Proxy (Crucial for Render/Reverse Proxies & express-rate-limit X-Forwarded-For validation)
app.set('trust proxy', 1);

// Configurable Allowed Origins for Production Security
const rawAllowed = process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL || '';
const customOrigins = rawAllowed
  .split(',')
  .map((o) => o.trim().toLowerCase())
  .filter(Boolean);

const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://beastmode.app',
  'https://beastmode-ai.vercel.app',
  'https://new-beast-mode.vercel.app',
];

// Security Middlewares
app.use(helmet()); // Sets various HTTP headers for security
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server requests, mobile apps, or local toolings with no origin header
      if (!origin) return callback(null, true);

      const lower = origin.toLowerCase();
      const isAllowed =
        customOrigins.includes(lower) ||
        defaultAllowedOrigins.includes(lower) ||
        lower.endsWith('.vercel.app') ||
        lower.endsWith('.beastmode.app');

      if (isAllowed) {
        return callback(null, true);
      }

      logger.warn(`[CORS Blocked]: Origin "${origin}" rejected by security policy.`);
      return callback(new Error('CORS policy: Access from this origin is forbidden'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

app.use(express.json({ limit: '10mb' })); // Parses incoming JSON requests
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rate Limiting to prevent brute-force and DDoS
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'تم تجاوز عدد الطلبات المسموح بها، يرجى المحاولة بعد 15 دقيقة.' },
});
app.use('/api', globalLimiter);

// Strict Rate Limiter for Login & Register to prevent Brute-Force & Credential Stuffing
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 10, // Max 10 attempts per IP per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'تم تجاوز عدد محاولات تسجيل الدخول المسموح بها. يرجى الانتظار والتحقق بعد 15 دقيقة للحفاظ على أمان حسابك.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/workout', workoutRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/sync', syncRoutes);

// root greeting route
app.get('/', (_req, res) => {
  res.send(`
    <div style="font-family: Arial, sans-serif; text-align: center; margin-top: 100px; color: #10b981;">
      <h1>BeastMode API Server is Running! 🏋️‍♂️🔥</h1>
      <p style="color: #6b7280; font-size: 16px;">Backend server is fully active and ready to power your fitness journey.</p>
      <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">v1.0.0 | SQLite | Express | TypeScript</p>
    </div>
  `);
});

// Comprehensive Health & Pulse Check Route
app.get('/api/health', async (_req, res) => {
  let dbStatus = 'connected';
  let dbError: any = null;
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err: any) {
    dbStatus = 'disconnected';
    dbError = err instanceof Error ? err.message : String(err);
    logger.error('Database Health Check Failed', err);
  }

  const isHealthy = dbStatus === 'connected';
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    database: dbStatus,
    ...(process.env.NODE_ENV !== 'production' && dbError ? { error: dbError } : {}),
    timestamp: Date.now(),
  });
});

// Global Error Handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled API Endpoint Error', err);
  res.status(500).json({
    status: 'error',
    message: 'حدث خطأ غير متوقع في الخادم، يرجى المحاولة لاحقاً',
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`[BeastMode Server] Running on http://localhost:${PORT}`);
});
