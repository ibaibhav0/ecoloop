import { complianceService } from '../services/complianceService.js';
import { ItemStore, HandoverStore, UserStore } from '../data/store.js';
import { notificationService } from '../services/notificationService.js';

export const complianceController = {
  /**
   * GET /api/compliance/status
   * Returns current compliance health score, 30-day handover SLA breaches, and CPCB recycler audits.
   */
  async getComplianceStatus(req, res) {
    try {
      const result = await complianceService.runComplianceAudit({ notifyAdmin: false });
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      console.error('Error fetching compliance status:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve compliance audit status: ' + err.message,
      });
    }
  },

  /**
   * POST /api/compliance/audit or /api/compliance/run-audit
   * Triggers an immediate compliance audit, evaluates 30-day SLA & CPCB validity,
   * and dispatches email alert + in-app dashboard notification to Admin.
   */
  async runAudit(req, res) {
    try {
      const result = await complianceService.runComplianceAudit({ notifyAdmin: true });
      return res.status(200).json({
        success: true,
        message: 'Compliance audit executed successfully. Alerts dispatched to campus administration.',
        data: result,
      });
    } catch (err) {
      console.error('Error running compliance audit:', err);
      return res.status(500).json({
        success: false,
        message: 'Compliance audit execution failed: ' + err.message,
      });
    }
  },

  /**
   * GET /api/compliance/recyclers
   * Returns official CPCB recycler registry with real validity dates and statutory status.
   */
  async getRecyclers(req, res) {
    try {
      const result = complianceService.getRecyclers();
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      console.error('Error fetching CPCB recyclers:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve CPCB recyclers: ' + err.message,
      });
    }
  },

  /**
   * GET /api/compliance/overdue-items
   * Returns only items currently in breach of the 30-day handover SLA.
   */
  async getOverdueItems(req, res) {
    try {
      const itemAudit = await complianceService.checkItemHandoverCompliance();
      return res.status(200).json({
        success: true,
        data: {
          criticalBreaches: itemAudit.criticalBreaches,
          warningsDueSoon: itemAudit.warningsDueSoon,
          unprocessedOverdue: itemAudit.unprocessedOverdue,
          totalBreaches: itemAudit.criticalBreachesCount,
        },
      });
    } catch (err) {
      console.error('Error fetching overdue items:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve overdue items: ' + err.message,
      });
    }
  },

  /**
   * POST /api/compliance/handover-urgent/:id
   * Admin 1-click action to immediately handover an overdue item to authorized recycler Janavi Bairoliya,
   * bringing the item back into statutory compliance!
   */
  async resolveOverdueItem(req, res) {
    try {
      const { id } = req.params;
      const { notes } = req.body;

      const item = await ItemStore.findById(id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Item not found' });
      }

      // Update item to handed_over
      const updated = await ItemStore.updateById(item._id, {
        status: 'handed_over',
        notes: notes || `Urgent statutory compliance dispatch to Authorised Recycler Janavi Bairoliya (CleanGreen Recovery - CPCB/EPR/RECYCLER/2023/KA-08492). 30-day SLA breach cleared.`,
      });

      // Record Handover Manifest
      await HandoverStore.create({
        itemId: item._id,
        trackingCode: item.trackingCode,
        fromRole: 'admin',
        toRole: 'recycler',
        location: 'Campus Central E-Waste Facility (Urgent Compliance Gate)',
        actorName: 'Manan Sehgal (Campus Admin)',
        actorId: 'admin_compliance_dispatch',
        verified: true,
        notes: `Statutory 30-day SLA resolution manifest. Transferred to Janavi Bairoliya.`,
      });

      // Re-run audit to reflect resolved health score
      const newAudit = await complianceService.runComplianceAudit({ notifyAdmin: false });

      return res.status(200).json({
        success: true,
        message: `Consignment ${item.trackingCode} successfully handed over to CPCB-authorized recycler Janavi Bairoliya. SLA breach cleared!`,
        data: {
          item: updated,
          newComplianceScore: newAudit.healthScore,
        },
      });
    } catch (err) {
      console.error('Error resolving overdue item:', err);
      return res.status(500).json({
        success: false,
        message: 'Failed to resolve overdue item: ' + err.message,
      });
    }
  },
};
