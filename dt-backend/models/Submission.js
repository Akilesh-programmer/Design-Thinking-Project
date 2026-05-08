import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileUrl: String,
    s3Key: String,
    fileHash: String,
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['submitted', 'graded', 'returned'],
      default: 'submitted',
    },
    grade: Number,
    feedback: String,
    gradedAt: Date,
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    metadata: {
      fileName: String,
      fileSize: Number,
      contentType: String,
      deviceMetadata: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

// Compound index
submissionSchema.index({ assignmentId: 1, userId: 1 });

export default mongoose.model('Submission', submissionSchema);
