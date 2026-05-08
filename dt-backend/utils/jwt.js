import jwt from 'jsonwebtoken';
import { setupLogging } from './logger.js';

const logger = setupLogging();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';
const REFRESH_TOKEN_EXPIRE = process.env.REFRESH_TOKEN_EXPIRE || '30d';

export const generateToken = (userId, tokenType = 'access') => {
  try {
    const expiresIn = tokenType === 'refresh' ? REFRESH_TOKEN_EXPIRE : JWT_EXPIRE;
    const token = jwt.sign(
      { userId, tokenType },
      JWT_SECRET,
      { expiresIn }
    );
    return token;
  } catch (error) {
    logger.error('Token generation error:', error);
    throw error;
  }
};

export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    logger.error('Token verification error:', error.message);
    throw error;
  }
};

export const generateTokenPair = (userId) => {
  const accessToken = generateToken(userId, 'access');
  const refreshToken = generateToken(userId, 'refresh');
  return { accessToken, refreshToken };
};

export const refreshAccessToken = (refreshToken) => {
  try {
    const decoded = verifyToken(refreshToken);
    
    if (decoded.tokenType !== 'refresh') {
      throw new Error('Invalid refresh token');
    }

    return generateToken(decoded.userId, 'access');
  } catch (error) {
    logger.error('Refresh token error:', error.message);
    throw error;
  }
};
