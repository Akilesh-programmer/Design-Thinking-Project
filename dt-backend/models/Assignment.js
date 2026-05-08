import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an assignment title'],
      trim: true,
    },
    description: {
      type: String,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dueDate: {
      type: Date,
      required: [true, 'Please provide a due date'],
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'closed', 'graded'],
      default: 'draft',
    },
    submissionType: {
      type: String,
      enum: ['photo', 'document', 'mixed'],
      default: 'photo',
    },
    maxPoints: {
      type: Number,
      default: 100,
    },
    rubric: {
      type: mongoose.Schema.Types.Mixed,
    },
    submissionCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Assignment', assignmentSchema);
