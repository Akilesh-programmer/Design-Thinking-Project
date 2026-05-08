import AttendanceRecord from '../models/AttendanceRecord.js';
import AuditLog from '../models/AuditLog.js';
import User from '../models/User.js';
import { setupLogging } from '../utils/logger.js';

const logger = setupLogging();

export const getFlaggedRecords = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'instructor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const records = await AttendanceRecord.find({ status: 'flagged' })
      .populate('userId', 'name email')
      .populate('eventId', 'title')
      .sort({ flaggedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await AttendanceRecord.countDocuments({ status: 'flagged' });

    res.json({
      success: true,
      data: {
        records,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    logger.error('Get flagged records error:', error);
    next(error);
  }
};

export const overrideVerification = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can override verification',
      });
    }

    const { recordId } = req.params;
    const { verified, reason } = req.body;

    const record = await AttendanceRecord.findByIdAndUpdate(
      recordId,
      {
        verified,
        status: verified ? 'verified' : 'rejected',
        processedAt: new Date(),
      },
      { new: true }
    );

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found',
      });
    }

    // Create audit log
    await AuditLog.create({
      actorId: req.user._id,
      action: 'admin_override',
      targetType: 'attendance',
      targetId: recordId,
      metadata: { verified, reason },
    });

    logger.info(`Admin override for record ${recordId}`, { verified, reason });

    res.json({
      success: true,
      message: 'Verification overridden',
      data: record,
    });
  } catch (error) {
    logger.error('Override verification error:', error);
    next(error);
  }
};

export const getAuditLogs = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const { action, targetId, page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (action) query.action = action;
    if (targetId) query.targetId = targetId;

    const logs = await AuditLog.find(query)
      .populate('actorId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await AuditLog.countDocuments(query);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    logger.error('Get audit logs error:', error);
    next(error);
  }
};

export const getStatistics = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const totalRecords = await AttendanceRecord.countDocuments();
    const verifiedRecords = await AttendanceRecord.countDocuments({ verified: true });
    const flaggedRecords = await AttendanceRecord.countDocuments({ status: 'flagged' });
    const totalUsers = await User.countDocuments();

    const avgConfidence = await AttendanceRecord.aggregate([
      { $match: { confidence: { $exists: true, $ne: null } } },
      { $group: { _id: null, avgConfidence: { $avg: '$confidence' } } },
    ]);

    res.json({
      success: true,
      data: {
        totalRecords,
        verifiedRecords,
        flaggedRecords,
        totalUsers,
        verificationRate: ((verifiedRecords / totalRecords) * 100).toFixed(2) + '%',
        avgConfidence: avgConfidence[0]?.avgConfidence || 0,
      },
    });
  } catch (error) {
    logger.error('Get statistics error:', error);
    next(error);
  }
};

export const exportData = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const { format = 'csv', dateFrom, dateTo } = req.query;

    const query = {};
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const records = await AttendanceRecord.find(query)
      .populate('userId', 'name email')
      .populate('eventId', 'title');

    logger.info(`Data export initiated by ${req.user.email}`, { format, recordCount: records.length });

    if (format === 'json') {
      res.json({
        success: true,
        data: records,
      });
    } else if (format === 'csv') {
      // Convert to CSV
      const csv = convertToCSV(records);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="attendance-export.csv"');
      res.send(csv);
    }
  } catch (error) {
    logger.error('Export data error:', error);
    next(error);
  }
};

function convertToCSV(records) {
  const headers = ['User Name', 'User Email', 'Event Title', 'Status', 'Verified', 'Confidence', 'Submitted At'];
  const rows = records.map((r) => [
    r.userId.name,
    r.userId.email,
    r.eventId.title,
    r.status,
    r.verified,
    r.confidence,
    r.submittedAt,
  ]);

  const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
  return csv;
}
