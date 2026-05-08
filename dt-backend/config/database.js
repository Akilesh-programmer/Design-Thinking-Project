import mongoose from 'mongoose';
import { setupLogging } from '../utils/logger.js';

const logger = setupLogging();

const DB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/scaap';
const DB_NAME = process.env.DB_NAME || 'scaap';

export async function connectDatabase() {
  try {
    await mongoose.connect(DB_URI, {
      dbName: DB_NAME,
      serverSelectionTimeoutMS: 5000,
    });
    logger.info(`Connected to MongoDB database: ${DB_NAME}`);
  } catch (error) {
    logger.error('Database connection error:', error);
    throw error;
  }
}

export function disconnectDatabase() {
  return mongoose.disconnect();
}

export default mongoose;
