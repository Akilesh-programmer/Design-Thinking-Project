import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an event title'],
      trim: true,
    },
    description: {
      type: String,
    },
    startTime: {
      type: Date,
      required: [true, 'Please provide a start time'],
    },
    endTime: {
      type: Date,
      required: [true, 'Please provide an end time'],
    },
    location: {
      latitude: {
        type: Number,
        required: [true, 'Please provide latitude'],
      },
      longitude: {
        type: Number,
        required: [true, 'Please provide longitude'],
      },
      radiusMeters: {
        type: Number,
        default: 100, // 100 meters default
      },
      address: String,
    },
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    instructors: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    status: {
      type: String,
      enum: ['draft', 'active', 'completed', 'cancelled'],
      default: 'draft',
    },
    capacity: Number,
    enrolledCount: {
      type: Number,
      default: 0,
    },
    requiresPhotoProof: {
      type: Boolean,
      default: true,
    },
    allowLateLateSubmission: {
      type: Boolean,
      default: false,
    },
    lateSubmissionDeadlineMinutes: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index for geospatial queries
eventSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });

export default mongoose.model('Event', eventSchema);
