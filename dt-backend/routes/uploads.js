import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getSignedUploadURL, confirmUpload } from '../controllers/uploadController.js';

const router = express.Router();

router.post('/sign', authenticate, getSignedUploadURL);
router.post('/confirm', authenticate, confirmUpload);

export default router;
