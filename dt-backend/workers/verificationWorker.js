import 'dotenv/config';
import { connectDatabase } from './config/database.js';
import { initializeRedis } from './config/redis.js';
import { getVerificationQueue } from './services/queue.js';
import AttendanceRecord from './models/AttendanceRecord.js';
import AuditLog from './models/AuditLog.js';
import { setupLogging } from './utils/logger.js';
import { analyzeImage } from './utils/aiClient.js';
import { generateVerificationToken } from './utils/crypto.js';
import { getIO } from './services/socket.js';

const logger = setupLogging();

// Calculate distance between two coordinates (haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 1000; // Return distance in meters
}

// Main verification job processor
async function processVerificationJob(job) {
  logger.info(`Processing verification job ${job.id}`, { recordId: job.data.recordId });

  try {
    const { recordId, blobUrl, eventId, userId, geo } = job.data;

    // Fetch record and event
    const record = await AttendanceRecord.findById(recordId).populate('eventId');
    if (!record) {
      throw new Error(`Record not found: ${recordId}`);
    }

    const event = record.eventId;

    // Step 1: Call AI service for image analysis
    logger.info(`Analyzing image for ${recordId}`);
    let analysisResult = {
      imageQuality: { score: 0.8, issues: [] },
      exif: {},
      ocrText: [],
      tamperDetection: { probability: 0.05, issues: [] },
      faceMatch: { score: 0 },
    };

    try {
      analysisResult = await analyzeImage(blobUrl, recordId);
    } catch (error) {
      logger.error(`Image analysis failed for ${recordId}:`, error);
      // Continue with stub data for demonstration
    }

    // Step 2: Validate geo-fence
    const distance = calculateDistance(
      event.location.latitude,
      event.location.longitude,
      geo.latitude,
      geo.longitude
    );

    const geoWithinRadius = distance <= event.location.radiusMeters;

    // Step 3: Validate timeline
    const submittedTime = new Date(record.submittedAt);
    const minutesFromStart = (submittedTime - new Date(event.startTime)) / 60000;
    const withinTimeWindow = minutesFromStart >= -5 && minutesFromStart <= 120; // 5 min before to 2 hours after

    // Step 4: Compute confidence score
    let confidence = 0.5;

    if (analysisResult.imageQuality?.score > 0.7) confidence += 0.15;
    if (geoWithinRadius) confidence += 0.2;
    if (withinTimeWindow) confidence += 0.15;
    if (analysisResult.faceMatch?.score > 0.8) confidence += 0.2;
    if ((analysisResult.tamperDetection?.probability || 0) < 0.1) confidence += 0.1;

    confidence = Math.min(1, Math.max(0, confidence));

    // Step 5: Final verification decision
    const verified = confidence > 0.75 && geoWithinRadius && withinTimeWindow;

    // Step 6: Generate verification token
    const tokenData = {
      recordId: recordId.toString(),
      photoHash: record.photoHash,
      verified,
      confidence,
      timestamp: new Date().toISOString(),
    };

    const { token, payload } = generateVerificationToken(tokenData);

    // Step 7: Update record with results
    record.evidence = {
      faceMatch: analysisResult.faceMatch,
      geoMatch: {
        withinRadius: geoWithinRadius,
        distance: Math.round(distance),
      },
      timelineMatch: {
        withinWindow: withinTimeWindow,
        minutesFromStart: Math.round(minutesFromStart),
      },
      imageQuality: analysisResult.imageQuality,
      exif: analysisResult.exif,
      ocrText: analysisResult.ocrText,
      tamperDetection: analysisResult.tamperDetection,
    };

    record.verified = verified;
    record.confidence = confidence;
    record.verificationToken = token;
    record.status = verified ? 'verified' : 'pending_review';
    record.processedAt = new Date();

    await record.save();

    // Step 8: Create audit log
    await AuditLog.create({
      action: 'attendance_verified',
      targetType: 'attendance',
      targetId: recordId,
      metadata: {
        verified,
        confidence,
        geoDistance: Math.round(distance),
      },
    });

    logger.info(`Verification completed for ${recordId}`, {
      verified,
      confidence,
      distance: Math.round(distance),
    });

    // Emit real-time notification to user
    try {
      const io = getIO();
      if (io) {
        io.to(`user:${userId}`).emit('verification_complete', {
          recordId: recordId.toString(),
          verified,
          confidence,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      logger.error('Failed to emit Socket.io notification:', error);
    }

    return {
      success: true,
      verified,
      confidence,
      recordId,
    };
  } catch (error) {
    logger.error(`Job processing failed for ${job.data.recordId}:`, error);

    // Mark record as pending review on error
    try {
      await AttendanceRecord.findByIdAndUpdate(
        job.data.recordId,
        { status: 'pending_review' }
      );
    } catch (updateError) {
      logger.error('Failed to update record status:', updateError);
    }

    throw error;
  }
}

// Initialize and start worker
async function startWorker() {
  try {
    logger.info('Starting verification worker...');

    // Initialize database and Redis
    await connectDatabase();
    logger.info('✓ Connected to MongoDB');

    await initializeRedis();
    logger.info('✓ Connected to Redis');

    // Get queue and process jobs
    const queue = getVerificationQueue();
    if (!queue) {
      throw new Error('Queue not initialized');
    }

    // Process jobs with concurrency of 3
    await queue.process(3, processVerificationJob);

    logger.info('✓ Verification worker started and listening for jobs');

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, shutting down gracefully...');
      await queue.close();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      logger.info('SIGINT received, shutting down gracefully...');
      await queue.close();
      process.exit(0);
    });
  } catch (error) {
    logger.error('Worker initialization failed:', error);
    process.exit(1);
  }
}

startWorker().catch((error) => {
  logger.error('Fatal worker error:', error);
  process.exit(1);
});
