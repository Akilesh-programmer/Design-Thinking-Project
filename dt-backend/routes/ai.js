import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  chatEndpoint,
  imageAnalysisEndpoint,
  callbackHandler,
} from '../controllers/aiController.js';

const router = express.Router();

router.post('/chat', authenticate, chatEndpoint);
router.post('/image', authenticate, imageAnalysisEndpoint);
router.post('/callback', callbackHandler);

export default router;
