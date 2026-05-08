import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
} from '../controllers/eventController.js';

const router = express.Router();

router.post('/', authenticate, authorize('admin', 'instructor'), createEvent);
router.get('/', authenticate, getEvents);
router.get('/:eventId', authenticate, getEvent);
router.put('/:eventId', authenticate, authorize('admin', 'instructor'), updateEvent);

export default router;
