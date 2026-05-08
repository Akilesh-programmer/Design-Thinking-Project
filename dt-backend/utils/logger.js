import winston from 'winston';
import fs from 'fs';
import path from 'path';

const logsDir = 'logs';

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

let logger = null;

export const setupLogging = () => {
  if (logger) return logger;

  logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.json()
    ),
    defaultMeta: { service: 'scaap-backend' },
    transports: [
      new winston.transports.File({
        filename: path.join(logsDir, 'error.log'),
        level: 'error',
      }),
      new winston.transports.File({
        filename: path.join(logsDir, 'combined.log'),
      }),
    ],
  });

  // Add console logging in development
  if (process.env.NODE_ENV !== 'production') {
    logger.add(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        ),
      })
    );
  }

  return logger;
};

export default setupLogging;
