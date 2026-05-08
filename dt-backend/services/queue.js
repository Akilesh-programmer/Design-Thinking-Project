import Queue from 'bull';
import { setupLogging } from '../utils/logger.js';
import { getRedisClient } from '../config/redis.js';

const logger = setupLogging();

let verificationQueue = null;

export async function initializeQueue() {
  try {
    const redis = getRedisClient();
    
    verificationQueue = new Queue('verification', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
      },
    });

    // Event listeners
    verificationQueue.on('completed', (job) => {
      logger.info(`Job completed: ${job.id}`, { recordId: job.data.recordId });
    });

    verificationQueue.on('failed', (job, error) => {
      logger.error(`Job failed: ${job.id}`, { error: error.message, recordId: job.data.recordId });
    });

    logger.info('Verification queue initialized');
  } catch (error) {
    logger.error('Queue initialization error:', error);
    throw error;
  }
}

export async function enqueueVerificationJob(jobData) {
  try {
    if (!verificationQueue) {
      await initializeQueue();
    }

    const job = await verificationQueue.add(jobData, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: false,
    });

    logger.info(`Job enqueued: ${job.id}`, { recordId: jobData.recordId });
    return job.id;
  } catch (error) {
    logger.error('Enqueue job error:', error);
    throw error;
  }
}

export function getVerificationQueue() {
  return verificationQueue;
}

export async function closeQueue() {
  if (verificationQueue) {
    await verificationQueue.close();
    verificationQueue = null;
  }
}
