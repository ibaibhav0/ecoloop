import express from 'express';
import { getAnalytics, getLeaderboard } from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/summary', getAnalytics);
router.get('/leaderboard', getLeaderboard);

export default router;
