import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes';
import workoutRoutes from './routes/workoutRoutes';
import nutritionRoutes from './routes/nutritionRoutes';
import chatRoutes from './routes/chatRoutes';
import statsRoutes from './routes/statsRoutes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet()); // Sets various HTTP headers for security
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Allow only frontend port
  credentials: true,
}));

app.use(express.json()); // Parses incoming JSON requests

// Rate Limiting to prevent brute-force and DDoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' },
});
app.use('/api', limiter);

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/workout', workoutRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/stats', statsRoutes);

// Basic Health Check Route
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'BeastMode API Server is running smoothly',
    timestamp: new Date().toISOString(),
  });
});

// Global Error Handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong on the server',
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`[BeastMode Server] Running on http://localhost:${PORT}`);
});
