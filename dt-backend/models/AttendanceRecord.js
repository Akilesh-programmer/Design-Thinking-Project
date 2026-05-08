import mongoose from 'mongoose';

const attendanceRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    blobUrl: {
      type: String,
      required: [true, 'Please provide a blob URL'],
    },
    s3Key: String,
    photoHash: {
      type: String,
      index: true,
    },
    geo: {
      latitude: Number,
      longitude: Number,
      accuracy: Number,
      timestamp: Date,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    processedAt: Date,
    status: {
      type: String,
      enum: ['pending', 'verified', 'flagged', 'rejected', 'pending_review'],
      default: 'pending',
    },
    verified: {
      type: Boolean,
      default: false,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
    },
    evidence: {
      faceMatch: {
        score: Number,
        embeddings: [Number],
      },
      geoMatch: {
        withinRadius: Boolean,
        distance: Number,
      },
      timelineMatch: {
        withinWindow: Boolean,
        minutesFromStart: Number,
      },
      imageQuality: {
        score: Number,
        issues: [String],
      },
      exif: {
        timestamp: Date,
        gpsLatitude: Number,
        gpsLongitude: Number,
        gpsAltitude: Number,
        cameraModel: String,
        softwareUsed: String,
      },
      ocrText: [String],
      tamperDetection: {
        probability: Number,
        issues: [String],
      },
    },
    verificationToken: String,
    verificationTokenSignature: String,
    flagReason: String,
    flaggedAt: Date,
    flaggedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewNotes: String,
    deviceMetadata: {
      deviceId: String,
      platform: String,
      appVersion: String,
      osVersion: String,
    },
  },
  { timestamps: true }
);

// Compound index for efficient queries
attendanceRecordSchema.index({ userId: 1, eventId: 1 });
attendanceRecordSchema.index({ status: 1, createdAt: -1 });
attendanceRecordSchema.index({ flagged: 1, createdAt: -1 });

export default mongoose.model('AttendanceRecord', attendanceRecordSchema);
