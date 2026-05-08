import express from 'express';
import { healthStatus, readiness } from '../controllers/healthController.js';

const router = express.Router();

router.get('/status', healthStatus);
router.get('/ready', readiness);

export default router;
