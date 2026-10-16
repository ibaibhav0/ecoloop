import express from 'express';
import { getNaacReportData, downloadNaacPdf } from '../controllers/reportController.js';

const router = express.Router();

// Public / Institutional Access for Accreditation Auditors & Admin
router.get('/naac-summary', getNaacReportData);
router.get('/naac-pdf', downloadNaacPdf);

export default router;
