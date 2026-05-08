import Event from '../models/Event.js';
import AuditLog from '../models/AuditLog.js';
import { setupLogging } from '../utils/logger.js';

const logger = setupLogging();

export const createEvent = async (req, res, next) => {
  try {
    const { title, description, startTime, endTime, location, capacity, requiresPhotoProof } = req.body;

    if (req.user.role !== 'admin' && req.user.role !== 'instructor') {
      return res.status(403).json({
        success: false,
        message: 'Only admins and instructors can create events',
      });
    }

    const event = new Event({
      title,
      description,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      location,
      organizerId: req.user._id,
      capacity,
      requiresPhotoProof,
      status: 'draft',
    });

    await event.save();

    // Create audit log
    await AuditLog.create({
      actorId: req.user._id,
      action: 'event_created',
      targetType: 'event',
      targetId: event._id,
    });

    logger.info(`Event created: ${event._id}`, { title });

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: event,
    });
  } catch (error) {
    logger.error('Create event error:', error);
    next(error);
  }
};

export const getEvents = async (req, res, next) => {
  try {
    const { status = 'active', page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (status) {
      query.status = status;
    }

    const events = await Event.find(query)
      .populate('organizerId', 'name email')
      .populate('instructors', 'name email')
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Event.countDocuments(query);

    res.json({
      success: true,
      data: {
        events,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    logger.error('Get events error:', error);
    next(error);
  }
};

export const getEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId)
      .populate('organizerId', 'name email')
      .populate('instructors', 'name email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    logger.error('Get event error:', error);
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const updates = req.body;

    if (req.user.role !== 'admin' && req.user.role !== 'instructor') {
      return res.status(403).json({
        success: false,
        message: 'Only admins and instructors can update events',
      });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check authorization
    if (event.organizerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the event organizer can update this event',
      });
    }

    const updated = await Event.findByIdAndUpdate(eventId, updates, { new: true });

    // Create audit log
    await AuditLog.create({
      actorId: req.user._id,
      action: 'event_updated',
      targetType: 'event',
      targetId: eventId,
      metadata: { updates },
    });

    logger.info(`Event updated: ${eventId}`);

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: updated,
    });
  } catch (error) {
    logger.error('Update event error:', error);
    next(error);
  }
};
