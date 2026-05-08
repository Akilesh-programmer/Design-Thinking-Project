import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getFlaggedRecords,
  overrideVerification,
  getAuditLogs,
  getStatistics,
  exportData,
} from '../controllers/adminController.js';

const router = express.Router();

router.get('/flagged', authenticate, authorize('admin', 'instructor'), getFlaggedRecords);
router.put('/override/:recordId', authenticate, authorize('admin'), overrideVerification);
router.get('/audit-logs', authenticate, authorize('admin'), getAuditLogs);
router.get('/statistics', authenticate, authorize('admin'), getStatistics);
router.get('/export', authenticate, authorize('admin'), exportData);

export default router;
