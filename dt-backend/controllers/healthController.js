import { setupLogging } from '../utils/logger.js';
import { healthCheck } from '../utils/aiClient.js';
import { getRedisClient } from '../config/redis.js';
import mongoose from 'mongoose';

const logger = setupLogging();

export const healthStatus = async (req, res, next) => {
  try {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      services: {
        database: 'unknown',
        redis: 'unknown',
        ai: 'unknown',
      },
    };

    // Check database
    try {
      if (mongoose.connection.readyState === 1) {
        health.services.database = 'ok';
      } else {
        health.services.database = 'error';
        health.status = 'degraded';
      }
    } catch (error) {
      health.services.database = 'error';
      health.status = 'degraded';
    }

    // Check Redis
    try {
      const redis = getRedisClient();
      await redis.ping();
      health.services.redis = 'ok';
    } catch (error) {
      health.services.redis = 'error';
      health.status = 'degraded';
    }

    // Check AI service
    try {
      const aiHealth = await healthCheck();
      health.services.ai = aiHealth.status === 'ok' ? 'ok' : 'error';
    } catch (error) {
      health.services.ai = 'error';
    }

    const statusCode = health.status === 'ok' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    logger.error('Health check error:', error);
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: error.message,
    });
  }
};

export const readiness = async (req, res, next) => {
  try {
    const redis = getRedisClient();
    await redis.ping();

    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected');
    }

    res.json({ ready: true });
  } catch (error) {
    logger.error('Readiness check failed:', error);
    res.status(503).json({ ready: false, error: error.message });
  }
};
