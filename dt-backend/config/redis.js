import redis from 'redis';
import { setupLogging } from '../utils/logger.js';

const logger = setupLogging();

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let redisClient = null;

export async function initializeRedis() {
  try {
    if (!redisClient) {
      redisClient = redis.createClient({
        url: REDIS_URL,
        socket: {
          reconnectStrategy: (retries) => Math.min(retries * 50, 500),
        },
      });

      redisClient.on('error', (error) => {
        logger.error('Redis Client Error:', error);
      });

      redisClient.on('connect', () => {
        logger.info('Connected to Redis');
      });

      await redisClient.connect();
    }
    return redisClient;
  } catch (error) {
    logger.error('Redis initialization error:', error);
    throw error;
  }
}

export function getRedisClient() {
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }
  return redisClient;
}

export async function closeRedis() {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}

export default getRedisClient;
