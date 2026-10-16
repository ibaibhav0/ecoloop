import express from 'express';
import { getTotalStats } from '../controllers/statsController.js';
import { requireApiKey } from '../middleware/apiKeyAuth.js';

const router = express.Router();

// Public / Federated endpoint for cumulative campus e-waste metrics
// Requires API key authentication (or JWT token)
router.get('/total', requireApiKey, getTotalStats);

export default router;
