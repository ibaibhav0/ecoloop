import express from 'express';
import { getNotifications, markAsRead, sendTestNotification } from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);
router.post('/test', sendTestNotification);

export default router;
