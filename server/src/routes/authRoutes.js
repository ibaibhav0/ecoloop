import express from 'express';
import { register, login, getMe, sendOtp, registerWithOtp } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/send-otp', sendOtp);
router.post('/register-with-otp', registerWithOtp);
router.post('/login', login);
router.get('/me', protect, getMe);

export default router;
