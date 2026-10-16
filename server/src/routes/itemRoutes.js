import express from 'express';
import {
  registerItem,
  schedulePickup,
  getItems,
  getItemById,
  scanLookup,
  collectItem,
  handoverToRecycler,
  recycleItem,
} from '../controllers/itemController.js';
import { protect, authorize } from '../middleware/auth.js';
import { requireApiKey } from '../middleware/apiKeyAuth.js';

const router = express.Router();

// Public item tracking by ID or trackingCode
router.get('/track/:id', getItemById);

// Authentication middleware (supports both Bearer JWT and X-API-Key / ?apiKey=)
router.use(requireApiKey);

// REST API Endpoints: Register and Query Items
router.post('/register', registerItem);
router.post('/', registerItem);
router.get('/', getItems);
router.get('/:id', getItemById);
router.post('/scan', scanLookup);
router.patch('/:id/schedule', schedulePickup);

// Collection Team & Admin actions
router.patch('/:id/collect', authorize('collector', 'collection', 'admin'), collectItem);
router.patch('/:id/handover', authorize('admin', 'collector', 'collection'), handoverToRecycler);

// Recycler & Admin actions
router.patch('/:id/recycle', authorize('recycler', 'admin'), recycleItem);

export default router;
