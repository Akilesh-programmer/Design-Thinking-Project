import axios from 'axios';
import { setupLogging } from './logger.js';

const logger = setupLogging();

const AI_API_BASE_URL = process.env.AI_API_BASE_URL || 'http://localhost:5000';
const AI_API_KEY = process.env.AI_API_KEY;

const aiClient = axios.create({
  baseURL: AI_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Authorization': `Bearer ${AI_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

/**
 * Call AI vision service for image analysis
 */
export const analyzeImage = async (blobUrl, recordId, options = {}) => {
  try {
    logger.info(`Calling AI vision service for ${recordId}`);

    const response = await aiClient.post('/api/image/analyze', {
      blobUrl,
      recordId,
      options,
    });

    return response.data;
  } catch (error) {
    logger.error(`AI vision service error for ${recordId}:`, error.message);
    throw new Error(`Image analysis failed: ${error.message}`);
  }
};

/**
 * Call AI chat service for conversational responses
 */
export const chat = async (messages, sessionId, options = {}) => {
  try {
    const response = await aiClient.post('/api/chat', {
      messages,
      sessionId,
      options,
    });

    return response.data;
  } catch (error) {
    logger.error('AI chat service error:', error.message);
    throw new Error(`Chat failed: ${error.message}`);
  }
};

/**
 * Stream chat responses
 */
export const chatStream = async (messages, sessionId, onChunk, options = {}) => {
  try {
    const response = await aiClient.post('/api/chat/stream', {
      messages,
      sessionId,
      options,
    }, {
      responseType: 'stream',
    });

    return new Promise((resolve, reject) => {
      response.data.on('data', (chunk) => {
        try {
          const lines = chunk.toString().split('\n');
          lines.forEach((line) => {
            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.slice(6));
              onChunk(data);
            }
          });
        } catch (error) {
          logger.error('Error parsing stream chunk:', error);
        }
      });

      response.data.on('end', resolve);
      response.data.on('error', reject);
    });
  } catch (error) {
    logger.error('AI chat stream error:', error.message);
    throw error;
  }
};

/**
 * Health check for AI service
 */
export const healthCheck = async () => {
  try {
    const response = await aiClient.get('/api/health');
    return response.data;
  } catch (error) {
    logger.error('AI service health check failed:', error.message);
    return { status: 'down' };
  }
};

export default {
  analyzeImage,
  chat,
  chatStream,
  healthCheck,
};
