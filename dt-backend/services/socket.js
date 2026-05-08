import { Server } from 'socket.io';
import { setupLogging } from '../utils/logger.js';

const logger = setupLogging();

let io = null;

export function initializeSocketIO(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    // Optional: Add authentication middleware here
    next();
  });

  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    // Join user-specific room for notifications
    socket.on('join_user_room', (userId) => {
      socket.join(`user:${userId}`);
      logger.info(`User ${userId} joined room`);
    });

    // Subscribe to event updates
    socket.on('subscribe_event', (eventId) => {
      socket.join(`event:${eventId}`);
      logger.info(`Socket ${socket.id} subscribed to event ${eventId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });

  logger.info('Socket.io initialized');
  return io;
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}

/**
 * Emit verification completion to user
 */
export function emitVerificationComplete(userId, data) {
  if (io) {
    io.to(`user:${userId}`).emit('verification_complete', {
      recordId: data.recordId,
      verified: data.verified,
      confidence: data.confidence,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Emit verification failure to user
 */
export function emitVerificationError(userId, error) {
  if (io) {
    io.to(`user:${userId}`).emit('verification_error', {
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Emit attendance flagged notification
 */
export function emitAttendanceFlagged(userId, recordId, reason) {
  if (io) {
    io.to(`user:${userId}`).emit('attendance_flagged', {
      recordId,
      reason,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Broadcast event update to all subscribers
 */
export function broadcastEventUpdate(eventId, update) {
  if (io) {
    io.to(`event:${eventId}`).emit('event_updated', {
      ...update,
      timestamp: new Date().toISOString(),
    });
  }
}
