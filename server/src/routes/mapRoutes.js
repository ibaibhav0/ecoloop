import express from 'express';
import { getMapLocations, getNearestDropoff } from '../controllers/mapController.js';

const router = express.Router();

// Real Campus Collection Points & Real CPCB-Authorised Recyclers
router.get('/locations', getMapLocations);

// Real-time nearest drop-off calculator based on student GPS or hostel
router.get('/nearest', getNearestDropoff);

export default router;
