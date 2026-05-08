import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import httpParamPollution from 'hpp';
import rateLimit from 'express-rate-limit';
import 'dotenv/config';
import http from 'http';

import { connectDatabase } from './config/database.js';
import { initializeRedis } from './config/redis.js';
import { setupLogging } from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initializeSocketIO } from './services/socket.js';

// Routes
import authRoutes from './routes/auth.js';
import uploadRoutes from './routes/uploads.js';
import attendanceRoutes from './routes/attendance.js';
import assignmentRoutes from './routes/assignments.js';
import eventRoutes from './routes/events.js';
import aiRoutes from './routes/ai.js';
import adminRoutes from './routes/admin.js';
import healthRoutes from './routes/health.js';

const app = express();
const PORT = process.env.PORT || 4000;

// Setup logging
const logger = setupLogging();

// Trust proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(httpParamPollution());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Compression
app.use(compression());

// Request logging
app.use(morgan('combined', { stream: { write: (message) => logger.info(message) } }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/health', healthRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl,
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Database and Redis initialization
async function initializeApp() {
  try {
    logger.info('Initializing SCAAP Backend...');
    
    // Connect to MongoDB
    await connectDatabase();
    logger.info('✓ Connected to MongoDB');
    
    // Initialize Redis
    const redis = await initializeRedis();
    logger.info('✓ Connected to Redis');
    
    // Create HTTP server for Socket.io
    const httpServer = http.createServer(app);
    
    // Initialize Socket.io
    initializeSocketIO(httpServer);
    
    // Start server
    httpServer.listen(PORT, () => {
      logger.info(`✓ Server running on port ${PORT}`);
      httpServer.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    });

    return httpS.info('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    });

    return server;
  } catch (error) {
    logger.error('Failed to initialize application:', error);
    process.exit(1);
  }
}

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  initializeApp().catch((error) => {
    logger.error('Application initialization failed:', error);
    process.exit(1);
  });
}

export default app;
