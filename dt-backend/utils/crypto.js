import crypto from 'crypto';
import { setupLogging } from './logger.js';

const logger = setupLogging();
const VERIFICATION_SECRET = process.env.VERIFICATION_SECRET || 'verification-secret-change-in-production';

export const computeFileHash = (fileBuffer) => {
  return crypto
    .createHash('sha256')
    .update(fileBuffer)
    .digest('hex');
};

export const generateVerificationToken = (recordData) => {
  try {
    const payload = {
      recordId: recordData.recordId,
      photoHash: recordData.photoHash,
      verified: recordData.verified,
      confidence: recordData.confidence,
      timestamp: recordData.timestamp || new Date().toISOString(),
    };

    const token = crypto
      .createHmac('sha256', VERIFICATION_SECRET)
      .update(JSON.stringify(payload))
      .digest('hex');

    return {
      token,
      payload,
    };
  } catch (error) {
    logger.error('Verification token generation error:', error);
    throw error;
  }
};

export const verifyVerificationToken = (token, payload) => {
  try {
    const expectedToken = crypto
      .createHmac('sha256', VERIFICATION_SECRET)
      .update(JSON.stringify(payload))
      .digest('hex');

    return token === expectedToken;
  } catch (error) {
    logger.error('Verification token verification error:', error);
    return false;
  }
};

export const generateUploadId = () => {
  return crypto.randomUUID();
};

export const generateJobId = () => {
  return `job-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
};
