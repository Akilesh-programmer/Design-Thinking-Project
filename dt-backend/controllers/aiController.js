import { setupLogging } from '../utils/logger.js';
import { chat, analyzeImage } from '../utils/aiClient.js';

const logger = setupLogging();

export const chatEndpoint = async (req, res, next) => {
  try {
    const { messages, sessionId } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        success: false,
        message: 'Messages array is required',
      });
    }

    const result = await chat(messages, sessionId || req.user._id.toString());

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('Chat error:', error);
    // Graceful fallback if AI service is unavailable
    res.status(503).json({
      success: false,
      message: 'AI service temporarily unavailable. Please try again later.',
    });
  }
};

export const imageAnalysisEndpoint = async (req, res, next) => {
  try {
    const { blobUrl, recordId } = req.body;

    if (!blobUrl || !recordId) {
      return res.status(400).json({
        success: false,
        message: 'blobUrl and recordId are required',
      });
    }

    logger.info(`Initiating image analysis for ${recordId}`);

    // Return job ID immediately; processing happens asynchronously
    const jobId = `job-${Date.now()}`;

    res.status(202).json({
      success: true,
      message: 'Analysis job queued',
      data: {
        jobId,
        status: 'processing',
      },
    });

    // Process asynchronously in background
    analyzeImage(blobUrl, recordId).catch((error) => {
      logger.error(`Image analysis failed for ${recordId}:`, error);
    });
  } catch (error) {
    logger.error('Image analysis endpoint error:', error);
    next(error);
  }
};

export const callbackHandler = async (req, res, next) => {
  try {
    const { jobId, recordId, result } = req.body;

    logger.info(`Received callback for job ${jobId}`, result);

    // Update record with results (handled by worker)
    // This endpoint serves as a webhook target for AI service

    res.json({
      success: true,
      message: 'Callback received',
    });
  } catch (error) {
    logger.error('Callback handler error:', error);
    next(error);
  }
};
