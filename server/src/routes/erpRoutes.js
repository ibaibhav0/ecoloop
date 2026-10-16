import express from 'express';
import {
  lookupStudent,
  getErpStatus,
  getAllErpStudents,
  uploadRosterCsv,
} from '../controllers/erpController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public student lookup for registration auto-fetch & status
router.get('/lookup', lookupStudent);
router.get('/status', getErpStatus);

// Admin-only management routes
router.get('/students', protect, authorize('admin'), getAllErpStudents);
router.post('/upload-csv', protect, authorize('admin'), uploadRosterCsv);

export default router;
