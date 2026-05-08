import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate, attendanceValidation } from '../middleware/validation.js';
import {
  createAttendanceRecord,
  getAttendanceRecords,
  getAttendanceRecord,
  flagAttendanceRecord,
} from '../controllers/attendanceController.js';

const router = express.Router();

router.post('/', authenticate, validate(attendanceValidation), createAttendanceRecord);
router.get('/', authenticate, getAttendanceRecords);
router.get('/:recordId', authenticate, getAttendanceRecord);
router.put('/:recordId/flag', authenticate, authorize('admin', 'instructor'), flagAttendanceRecord);

export default router;
