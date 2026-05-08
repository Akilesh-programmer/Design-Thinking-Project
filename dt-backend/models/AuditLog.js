import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    action: {
      type: String,
      required: true,
      enum: [
        'attendance_submitted',
        'attendance_verified',
        'attendance_flagged',
        'attendance_reviewed',
        'assignment_created',
        'assignment_submitted',
        'assignment_graded',
        'user_created',
        'user_deleted',
        'user_role_changed',
        'event_created',
        'event_updated',
        'event_deleted',
        'admin_override',
        'data_export',
      ],
    },
    targetType: {
      type: String,
      enum: ['attendance', 'assignment', 'user', 'event'],
    },
    targetId: mongoose.Schema.Types.ObjectId,
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
    changes: {
      before: mongoose.Schema.Types.Mixed,
      after: mongoose.Schema.Types.Mixed,
    },
    ipAddress: String,
    userAgent: String,
    statusCode: Number,
  },
  { timestamps: true }
);

// Index for efficient querying
auditLogSchema.index({ actorId: 1, createdAt: -1 });
auditLogSchema.index({ targetId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

export default mongoose.model('AuditLog', auditLogSchema);
