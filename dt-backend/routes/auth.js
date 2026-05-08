import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate, authValidation } from '../middleware/validation.js';
import {
  register,
  login,
  getMe,
  refreshToken,
  logout,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', validate(authValidation), register);
router.post('/login', validate(authValidation), login);
router.post('/refresh', refreshToken);
router.get('/me', authenticate, getMe);
router.post('/logout', authenticate, logout);

export default router;
