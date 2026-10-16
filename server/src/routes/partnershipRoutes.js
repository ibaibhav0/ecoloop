import express from 'express';
import {
  getHotspots,
  getAggregatedData,
  getPartners,
  registerPartner,
  getBulkPickups,
  createBulkPickup,
  updateBulkPickup,
} from '../controllers/partnershipController.js';

const router = express.Router();

// 1. City E-Waste Hotspots (CPCB & Municipal Reports)
router.get('/hotspots', getHotspots);

// 2. Aggregated Campus E-Waste Data (Anonymized for Municipalities & NGOs)
router.get('/aggregated-data', getAggregatedData);

// 3. Registered Partners Directory & Registration
router.get('/partners', getPartners);
router.post('/partners/register', registerPartner);

// 4. Bulk Pickups for Community Drives
router.get('/bulk-pickups', getBulkPickups);
router.post('/bulk-pickups', createBulkPickup);
router.patch('/bulk-pickups/:id/status', updateBulkPickup);

export default router;
