import express from 'express';
import { complianceController } from '../controllers/complianceController.js';

const router = express.Router();

/**
 * @openapi
 * /api/compliance/status:
 *   get:
 *     summary: Get overall campus compliance status and SLA breaches
 *     tags: [Compliance]
 *     responses:
 *       200:
 *         description: Compliance health report, item SLA audits, and CPCB recycler audits.
 */
router.get('/status', complianceController.getComplianceStatus);

/**
 * @openapi
 * /api/compliance/audit:
 *   post:
 *     summary: Run real-time compliance audit and dispatch alerts to Admin
 *     tags: [Compliance]
 *     responses:
 *       200:
 *         description: Audit results with email and dashboard alert confirmation.
 */
router.post('/audit', complianceController.runAudit);
router.post('/run-audit', complianceController.runAudit);

/**
 * @openapi
 * /api/compliance/recyclers:
 *   get:
 *     summary: Get CPCB recycler registry with real statutory authorization statuses
 *     tags: [Compliance]
 *     responses:
 *       200:
 *         description: List of verified active and expired CPCB recyclers.
 */
router.get('/recyclers', complianceController.getRecyclers);

/**
 * @openapi
 * /api/compliance/overdue-items:
 *   get:
 *     summary: Get items exceeding the 30-day handover SLA
 *     tags: [Compliance]
 *     responses:
 *       200:
 *         description: Overdue items list.
 */
router.get('/overdue-items', complianceController.getOverdueItems);

/**
 * @openapi
 * /api/compliance/handover-urgent/{id}:
 *   post:
 *     summary: Admin 1-click urgent handover to CPCB-authorized recycler Janavi Bairoliya
 *     tags: [Compliance]
 */
router.post('/handover-urgent/:id', complianceController.resolveOverdueItem);

export default router;
