import { WhatsAppService } from './whatsappService.js';
import { UserModel, MemStore } from '../models/index.js';

export class NotificationService {
  /**
   * Helper to query users by role
   */
  static async getUsersByRole(role) {
    try {
      const users = await UserModel.find({ role }).lean();
      if (users && users.length > 0) return users;
    } catch (e) {
      // Fallback to memory store
    }
    const memUsers = Array.from(MemStore.users.values()).filter((u) => u.role === role);
    return memUsers;
  }

  /**
   * Notify Collection Team about new pickup slot
   */
  static async notifyCollectionTeamOnSchedule(item) {
    const collectors = await this.getUsersByRole('collection');
    const msg =
      `📦 *MISSION NOTIFICATION: PICKUP SCHEDULED*\n\n` +
      `Item: *${item.type}* (~${item.approxWeight} kg)\n` +
      `Hostel: *${item.userHostel}*\n` +
      `Slot: *${item.pickupDate}* @ *${item.location}*\n` +
      `Tracking Code: *${item.trackingCode}*\n\n` +
      `Send *"Scan"* and reply with photo of item QR to record calibrated weight.`;

    for (const collector of collectors) {
      if (collector.phone && collector.phone !== item.userPhone) {
        await WhatsAppService.sendText(collector.phone, msg);
      }
    }
  }

  /**
   * Notify Student when item is officially collected
   */
  static async notifyStudentOnCollected(item, studentPhone) {
    const msg =
      `✅ *ITEM COLLECTED & CALIBRATED*\n\n` +
      `Tracking Code: *${item.trackingCode}*\n` +
      `Category: *${item.type}*\n` +
      `Calibrated Weight: *${item.actualWeight} kg*\n` +
      `Status: *Transferred to Campus Holding Facility*\n\n` +
      `Your reward points will be unlocked upon final certified recycler processing!`;

    await WhatsAppService.sendButtons(studentPhone, msg, [
      { id: 'btn_status', title: 'Check Status' },
      { id: 'btn_feedback', title: 'Rate Pickup' },
    ]);
  }

  /**
   * Notify Admin that item is ready for handover to CPCB recycler
   */
  static async notifyAdminOnCollected(item) {
    const admins = await this.getUsersByRole('admin');
    const msg =
      `📋 *COLLECTION VERIFIED: READY FOR HANDOVER*\n\n` +
      `Code: *${item.trackingCode}*\n` +
      `Weight: *${item.actualWeight} kg* (${item.type})\n` +
      `Hostel: *${item.userHostel}*\n\n` +
      `Reply *"Handover"* to route this item to an authorised CPCB recycler.`;

    for (const admin of admins) {
      if (admin.phone) {
        await WhatsAppService.sendText(admin.phone, msg);
      }
    }
  }

  /**
   * Notify Recycler that item has been dispatched for destruction
   */
  static async notifyRecyclerOnHandover(item, recyclerName) {
    const recyclers = await this.getUsersByRole('recycler');
    const msg =
      `🚚 *INCOMING RECYCLING DISPATCH*\n\n` +
      `Item Code: *${item.trackingCode}*\n` +
      `Type: *${item.type}* (${item.actualWeight} kg)\n` +
      `Assigned Recycler: *${recyclerName}*\n\n` +
      `Upon receipt at facility, send *"Verify"* and reply with QR photo to issue digital EPR Certificate.`;

    for (const rec of recyclers) {
      if (rec.phone) {
        await WhatsAppService.sendText(rec.phone, msg);
      }
    }
  }

  /**
   * Notify Student & update points when recycler finishes recycling
   */
  static async notifyStudentOnRecycled(item, studentPhone, pointsAwarded, co2SavedKg, certUrl) {
    const msg =
      `♻️ *MISSION COMPLETE: ITEM VERIFIED RECYCLED!*\n\n` +
      `Tracking Code: *${item.trackingCode}*\n` +
      `Category: *${item.type}* (${item.actualWeight} kg)\n` +
      `Recycler: *${item.assignedRecycler || 'Authorised CPCB Facility'}*\n\n` +
      `🎉 *+${pointsAwarded} REWARD POINTS* credited!\n` +
      `🌿 *CO2e Avoided*: *${co2SavedKg} kg*\n\n` +
      `Your digital EPR Certificate has been issued below:`;

    await WhatsAppService.sendText(studentPhone, msg);

    if (certUrl) {
      await WhatsAppService.sendDocument(
        studentPhone,
        certUrl,
        `EPR_Certificate_${item.trackingCode}.pdf`,
        `Formal CPCB Statutory EPR Destruction Certificate`
      );
    }
  }
}
