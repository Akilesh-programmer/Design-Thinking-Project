import AttendanceRecord from '../models/AttendanceRecord.js';
import Event from '../models/Event.js';
import AuditLog from '../models/AuditLog.js';
import { setupLogging } from '../utils/logger.js';
import { enqueueVerificationJob } from '../services/queue.js';

const logger = setupLogging();

export const createAttendanceRecord = async (req, res, next) => {
  try {
    const { eventId, blobUrl, geo, deviceMetadata } = req.body;
    const userId = req.user._id;

    // Validate event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check if already submitted for this event
    const existing = await AttendanceRecord.findOne({ userId, eventId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Already submitted attendance for this event',
      });
    }

    // Create attendance record
    const record = new AttendanceRecord({
      userId,
      eventId,
      blobUrl,
      geo: {
        latitude: geo.latitude,
        longitude: geo.longitude,
        accuracy: geo.accuracy,
        timestamp: geo.timestamp || new Date(),
      },
      deviceMetadata,
      status: 'pending',
    });

    await record.save();

    // Enqueue verification job
    const jobId = await enqueueVerificationJob({
      recordId: record._id.toString(),
      blobUrl,
      eventId: eventId.toString(),
      userId: userId.toString(),
      geo,
    });

    // Create audit log
    await AuditLog.create({
      actorId: userId,
      action: 'attendance_submitted',
      targetType: 'attendance',
      targetId: record._id,
      metadata: {
        eventId,
        jobId,
      },
    });

    logger.info(`Attendance record created: ${record._id}`, { jobId });

    res.status(201).json({
      success: true,
      message: 'Attendance submitted successfully',
      data: {
        recordId: record._id,
        status: record.status,
        jobId,
      },
    });
  } catch (error) {
    logger.error('Create attendance error:', error);
    next(error);
  }
};

export const getAttendanceRecords = async (req, res, next) => {
  try {
    const { eventId, status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const query = {};

    // Student can only see their own records
    if (req.user.role === 'student') {
      query.userId = req.user._id;
    } else if (eventId) {
      // Admin/instructor can filter by event
      query.eventId = eventId;
    }

    if (status) {
      query.status = status;
    }

    const records = await AttendanceRecord.find(query)
      .populate('userId', 'name email')
      .populate('eventId', 'title startTime endTime')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await AttendanceRecord.countDocuments(query);

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
    logger.error('Get attendance records error:', error);
    next(error);
  }
};

export const getAttendanceRecord = async (req, res, next) => {
  try {
    const { recordId } = req.params;

    const record = await AttendanceRecord.findById(recordId)
      .populate('userId', 'name email')
      .populate('eventId', 'title startTime endTime location');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found',
      });
    }

    // Check access
    if (req.user.role === 'student' && record.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    logger.error('Get attendance record error:', error);
    next(error);
  }
};

export const flagAttendanceRecord = async (req, res, next) => {
  try {
    const { recordId } = req.params;
    const { reason } = req.body;

    if (req.user.role !== 'admin' && req.user.role !== 'instructor') {
      return res.status(403).json({
        success: false,
        message: 'Only admins and instructors can flag records',
      });
    }

    const record = await AttendanceRecord.findByIdAndUpdate(
      recordId,
      {
        status: 'flagged',
        flagReason: reason,
        flaggedAt: new Date(),
        flaggedBy: req.user._id,
      },
      { new: true }
    );

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found',
      });
    }

    // Create audit log
    await AuditLog.create({
      actorId: req.user._id,
      action: 'attendance_flagged',
      targetType: 'attendance',
      targetId: record._id,
      metadata: { reason },
    });

    logger.info(`Attendance record flagged: ${recordId}`, { reason });

    res.json({
      success: true,
      message: 'Record flagged successfully',
      data: record,
    });
  } catch (error) {
    logger.error('Flag attendance record error:', error);
    next(error);
  }
};
