import { WhatsAppService } from '../services/whatsappService.js';
import { QrService } from '../services/qrService.js';
import { ReportService } from '../services/reportService.js';
import { NotificationService } from '../services/notificationService.js';
import { ComplianceService } from '../services/complianceService.js';
import { EWasteItemModel, UserModel, MemStore } from '../models/index.js';
import { isMongoConnected } from '../config/db.js';

export class RecyclerFlow {
  static async handle(user, message, from) {
    const text = (message.text || message.buttonReplyId || message.listReplyId || '').trim();
    const lower = text.toLowerCase();
    const state = user.sessionState?.step || null;

    // Handle Active Recycler States
    if (state === 'recycler_awaiting_qr') {
      if (message.type === 'image' && message.image?.id) {
        await WhatsAppService.sendText(from, `🔍 Decoding QR code from camera image...`);
        const buffer = await WhatsAppService.downloadMedia(message.image.id);
        const decoded = await QrService.decodeQrFromImageBuffer(buffer);

        if (decoded) {
          return this.verifyAndRecycleItem(user, from, decoded);
        } else {
          return WhatsAppService.sendText(
            from,
            `⚠️ Could not scan QR code clearly. Reply directly with the tracking code (e.g. *ECL-202610-ABCD*):`
          );
        }
      } else if (text.toUpperCase().startsWith('ECL-') || text.length > 5) {
        const code = QrService.parseQrPayload(text);
        return this.verifyAndRecycleItem(user, from, code);
      }
    }

    // Direct Image Handling
    if (message.type === 'image' && message.image?.id) {
      await WhatsAppService.sendText(from, `🔍 Decoding QR code from camera image...`);
      const buffer = await WhatsAppService.downloadMedia(message.image.id);
      const decoded = await QrService.decodeQrFromImageBuffer(buffer);

      if (decoded) {
        return this.verifyAndRecycleItem(user, from, decoded);
      }
    }

    // Recycler Commands
    if (lower === 'verify' || lower === 'btn_recycler_verify') {
      user.sessionState = { step: 'recycler_awaiting_qr', updatedAt: new Date() };
      await this.saveUser(user);

      return WhatsAppService.sendText(
        from,
        `📷 *AUTHORISED RECYCLER VERIFICATION*\n\n` +
        `Send a photo of the item's EcoLoop QR Code to confirm physical receipt and statutory destruction.\n\n` +
        `_Or reply with the tracking code directly (e.g. "ECL-202610-ABCD")_`
      );
    }

    if (lower === 'history' || lower === 'btn_recycler_history') {
      return this.sendHistory(user, from);
    }

    // Default Recycler Menu
    return WhatsAppService.sendButtons(
      from,
      `*AUTHORISED CPCB RECYCLER CONSOLE* ♻️\n\n` +
      `Facility Operator: *${user.name || 'CPCB Recycler'}*\n` +
      `Statutory Status: *Authorized Formal Facility*\n\n` +
      `Select an operation:`,
      [
        { id: 'btn_recycler_verify', title: '📷 Scan & Verify QR' },
        { id: 'btn_recycler_history', title: '📜 Processing History' },
      ]
    );
  }

  /**
   * Verify QR and Issue Digital EPR Certificate
   */
  static async verifyAndRecycleItem(user, from, trackingCode) {
    const item = await this.getItemByCode(trackingCode);

    if (!item) {
      await this.clearUserState(user);
      return WhatsAppService.sendButtons(
        from,
        `⚠️ Hardware record not found: *${trackingCode}*. Check tracking code and try again.`,
        [{ id: 'btn_recycler_verify', title: 'Scan Again' }]
      );
    }

    if (item.status === 'verified_recycled') {
      await this.clearUserState(user);
      return WhatsAppService.sendButtons(
        from,
        `ℹ️ Item *${trackingCode}* was already marked as VERIFIED RECYCLED on ${new Date(item.recycledAt).toLocaleDateString()}.`,
        [{ id: 'btn_recycler_verify', title: 'Scan Next Item' }]
      );
    }

    // Mark as VERIFIED RECYCLED
    const weight = item.actualWeight || item.approxWeight || 1;
    item.status = 'verified_recycled';
    item.recycledAt = new Date();
    item.assignedRecycler = user.name || 'M/s WB E-Waste Control Management Pvt. Ltd.';

    // Generate Official EPR Certificate PDF
    const certData = await ReportService.generateEprCertificatePdf(item, {
      name: item.assignedRecycler,
      location: 'Howrah, West Bengal',
      cpcbRegNumber: 'CPCB/EPR/2023/REC-0595',
    });

    const co2SavedKg = ComplianceService.calculateCo2Saved(weight);
    const pointsAwarded = Math.round(weight * 10); // 10 pts per kg collected

    item.eprCertificate = {
      certificateId: certData.certId,
      issuedAt: new Date(),
      cpcbRecyclerName: item.assignedRecycler,
      cpcbRegNo: 'CPCB/EPR/2023/REC-0595',
      co2SavedKg,
      pdfUrl: certData.publicUrl,
    };

    await this.saveItem(item);

    // Credit Points to Student
    if (item.userPhone) {
      await this.creditStudentPoints(item.userPhone, pointsAwarded);
      // Notify Student with EPR Certificate document
      await NotificationService.notifyStudentOnRecycled(item, item.userPhone, pointsAwarded, co2SavedKg, certData.publicUrl);
    }

    await this.clearUserState(user);

    // Send confirmation to Recycler with EPR Certificate document
    await WhatsAppService.sendText(
      from,
      `✅ *STATUTORY DESTRUCTION CONFIRMED*\n\n` +
      `Code: *${item.trackingCode}*\n` +
      `Category: *${item.type}* (${weight} kg)\n` +
      `EPR Certificate ID: *${certData.certId}*\n` +
      `Student Awarded: *+${pointsAwarded} PTS*\n` +
      `CO2 Avoided: *${co2SavedKg} kg*\n\n` +
      `Digital certificate generated and delivered to student.`
    );

    return WhatsAppService.sendDocument(
      from,
      certData.publicUrl,
      certData.fileName,
      `Official CPCB EPR Destruction Certificate: ${item.trackingCode}`
    );
  }

  /**
   * Recycler History (Real Data)
   */
  static async sendHistory(user, from) {
    const allItems = await this.getAllItems();
    const verified = allItems.filter((i) => i.status === 'verified_recycled');

    if (verified.length === 0) {
      return WhatsAppService.sendButtons(
        from,
        `📜 *PROCESSING HISTORY: 0 ITEMS*\n\n` +
        `No items have been certified at this facility yet. Send *"Verify"* to process your first receipt.`,
        [{ id: 'btn_recycler_verify', title: 'Verify QR' }]
      );
    }

    let msg = `📜 *CERTIFIED RECYCLING LOG (${verified.length} Units)*:\n\n`;
    verified.slice(0, 8).forEach((item, idx) => {
      msg += `*${idx + 1}. [${item.trackingCode}]* - ${item.type}\n`;
      msg += `   Weight: ${(item.actualWeight || item.approxWeight).toFixed(2)} kg\n`;
      msg += `   Date: ${new Date(item.recycledAt || item.updatedAt).toLocaleDateString()}\n`;
      msg += `   EPR Cert: ${item.eprCertificate?.certificateId || 'Issued'}\n\n`;
    });

    return WhatsAppService.sendButtons(from, msg, [{ id: 'btn_recycler_verify', title: 'Scan Next Item' }]);
  }

  // --- Helpers ---
  static async getItemByCode(code) {
    if (isMongoConnected) {
      try {
        const item = await EWasteItemModel.findOne({ trackingCode: code }).lean();
        if (item) return item;
      } catch (e) {}
    }
    return MemStore.items.get(code) || null;
  }

  static async saveItem(item) {
    if (isMongoConnected) {
      try {
        await EWasteItemModel.findOneAndUpdate({ trackingCode: item.trackingCode }, item, { upsert: true });
      } catch (e) {}
    }
    MemStore.items.set(item.trackingCode, item);
  }

  static async getAllItems() {
    if (isMongoConnected) {
      try {
        const items = await EWasteItemModel.find().lean();
        if (items && items.length > 0) return items;
      } catch (e) {}
    }
    return Array.from(MemStore.items.values());
  }

  static async creditStudentPoints(phone, points) {
    if (isMongoConnected) {
      try {
        await UserModel.findOneAndUpdate({ phone }, { $inc: { points } });
      } catch (e) {}
    }
    const memUser = MemStore.users.get(phone);
    if (memUser) {
      memUser.points = (memUser.points || 0) + points;
    }
  }

  static async saveUser(user) {
    if (isMongoConnected) {
      try {
        if (user.save) await user.save();
      } catch (e) {}
    }
    MemStore.users.set(user.phone, user);
  }

  static async clearUserState(user) {
    user.sessionState = { step: null, draftItem: {}, updatedAt: new Date() };
    await this.saveUser(user);
  }
}
