import { WhatsAppService } from '../services/whatsappService.js';
import { QrService } from '../services/qrService.js';
import { NotificationService } from '../services/notificationService.js';
import { EWasteItemModel, HandoverModel, MemStore } from '../models/index.js';
import { isMongoConnected } from '../config/db.js';

export class CollectorFlow {
  static async handle(user, message, from) {
    const text = (message.text || message.buttonReplyId || message.listReplyId || '').trim();
    const lower = text.toLowerCase();
    const state = user.sessionState?.step || null;

    // Handle Active Collector States
    if (state) {
      // 1. Weighing state
      if (state.startsWith('collector_weighing_')) {
        const trackingCode = state.replace('collector_weighing_', '');
        const weight = parseFloat(text.replace(/[^0-9.]/g, ''));

        if (isNaN(weight) || weight <= 0) {
          await WhatsAppService.sendText(from, `⚠️ Enter a valid numeric weight in kg (e.g. 1.2 or 0.45):`);
          return;
        }

        const item = await this.getItemByCode(trackingCode);
        if (!item) {
          await WhatsAppService.sendText(from, `Item ${trackingCode} not found in database.`);
          await this.clearUserState(user);
          return;
        }

        // Mark item as COLLECTED with calibrated weight
        item.actualWeight = weight;
        item.status = 'collected';
        item.collectedAt = new Date();
        item.assignedCollector = user.name || 'Campus Collection Team';
        await this.saveItem(item);

        // Record Handover
        await this.recordHandover({
          itemId: item._id,
          trackingCode: item.trackingCode,
          fromRole: 'student',
          toRole: 'collection',
          actorPhone: user.phone,
          actorName: user.name,
          location: item.location || user.hostel,
        });

        await this.clearUserState(user);

        // Notify Student and Admin
        if (item.userPhone) {
          await NotificationService.notifyStudentOnCollected(item, item.userPhone);
        }
        await NotificationService.notifyAdminOnCollected(item);

        return WhatsAppService.sendButtons(
          from,
          `✅ *ITEM MARKED AS COLLECTED*\n\n` +
          `Code: *${item.trackingCode}*\n` +
          `Category: *${item.type}*\n` +
          `Calibrated Weight: *${weight} kg*\n` +
          `Hostel Origin: *${item.userHostel}*\n\n` +
          `Student notified. Item is now ready in holding facility for recycler handover.`,
          [
            { id: 'btn_collector_scan', title: '📷 Scan Next QR' },
            { id: 'btn_collector_pending', title: '📋 Pending Pickups' },
          ]
        );
      }

      // 2. Awaiting QR photo state
      if (state === 'collector_awaiting_qr') {
        if (message.type === 'image' && message.image?.id) {
          await WhatsAppService.sendText(from, `🔍 Decoding QR code from camera image...`);
          const buffer = await WhatsAppService.downloadMedia(message.image.id);
          const decoded = await QrService.decodeQrFromImageBuffer(buffer);

          if (decoded) {
            return this.initiateWeighing(user, from, decoded);
          } else {
            await WhatsAppService.sendText(
              from,
              `⚠️ Could not decode QR code clearly. Reply directly with the tracking code (e.g. "ECL-202610-ABCD"):`
            );
            return;
          }
        } else if (text.toUpperCase().startsWith('ECL-') || text.length > 5) {
          const code = QrService.parseQrPayload(text);
          return this.initiateWeighing(user, from, code);
        }
      }
    }

    // Direct Photo Handling (If collector sends photo directly without typing "Scan")
    if (message.type === 'image' && message.image?.id) {
      await WhatsAppService.sendText(from, `🔍 Decoding QR code from camera image...`);
      const buffer = await WhatsAppService.downloadMedia(message.image.id);
      const decoded = await QrService.decodeQrFromImageBuffer(buffer);

      if (decoded) {
        return this.initiateWeighing(user, from, decoded);
      }
    }

    // Collector Commands
    if (lower === 'scan' || lower === 'btn_collector_scan') {
      user.sessionState = { step: 'collector_awaiting_qr', updatedAt: new Date() };
      await this.saveUser(user);

      return WhatsAppService.sendText(
        from,
        `📷 *COLLECTION TEAM SCANNER*\n\n` +
        `Send a photo of the item's EcoLoop QR Code now, or reply with the tracking code (e.g. *ECL-202610-ABCD*):`
      );
    }

    if (lower === 'pending' || lower === 'btn_collector_pending') {
      return this.sendPendingPickups(user, from);
    }

    if (lower === 'collected') {
      return WhatsAppService.sendText(
        from,
        `To mark an item as collected, first send *"Scan"* and provide the QR photo or tracking code.`
      );
    }

    // Default Collector Menu
    return WhatsAppService.sendButtons(
      from,
      `*CAMPUS COLLECTION TEAM CONSOLE* 📦\n\n` +
      `Operator: *${user.name || 'Collector'}*\n` +
      `Station: *${user.hostel || 'Central Campus Hub'}*\n\n` +
      `Select a task:`,
      [
        { id: 'btn_collector_scan', title: '📷 Scan QR Code' },
        { id: 'btn_collector_pending', title: '📋 Pending Pickups' },
      ]
    );
  }

  static async initiateWeighing(user, from, trackingCode) {
    const item = await this.getItemByCode(trackingCode);
    if (!item) {
      await WhatsAppService.sendButtons(
        from,
        `⚠️ No registered hardware found with code: *${trackingCode}*.`,
        [{ id: 'btn_collector_scan', title: 'Try Again' }]
      );
      await this.clearUserState(user);
      return;
    }

    user.sessionState = { step: `collector_weighing_${trackingCode}`, updatedAt: new Date() };
    await this.saveUser(user);

    return WhatsAppService.sendText(
      from,
      `🎯 *QR VERIFIED: ${item.trackingCode}*\n\n` +
      `Category: *${item.type}*\n` +
      `Student: *${item.userName || item.userPhone}*\n` +
      `Hostel: *${item.userHostel}*\n` +
      `Estimated Weight: ~${item.approxWeight} kg\n\n` +
      `⚖️ *ACTION REQUIRED*: Place on digital campus scale and reply with *actual calibrated weight in kg* (e.g. *1.75*):`
    );
  }

  static async sendPendingPickups(user, from) {
    const allItems = await this.getAllItems();
    const pending = allItems.filter((i) => ['registered', 'scheduled'].includes(i.status));

    if (pending.length === 0) {
      return WhatsAppService.sendButtons(
        from,
        `📋 *PENDING PICKUPS: 0*\n\n` +
        `All scheduled campus e-waste items have been collected! Stand by for incoming student submissions.`,
        [{ id: 'btn_collector_scan', title: '📷 Scan QR' }]
      );
    }

    let msg = `📋 *ACTIVE PENDING PICKUPS (${pending.length})*:\n\n`;
    pending.forEach((item, idx) => {
      msg += `*${idx + 1}. [${item.trackingCode}]* - ${item.type}\n`;
      msg += `   Hostel: ${item.userHostel}\n`;
      msg += `   Slot: ${item.pickupDate || 'Not yet scheduled'}\n`;
      msg += `   Approx: ~${item.approxWeight} kg\n\n`;
    });

    msg += `To collect an item, reply *"Scan"* and provide the QR photo.`;
    return WhatsAppService.sendButtons(from, msg, [{ id: 'btn_collector_scan', title: '📷 Scan QR Code' }]);
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

  static async recordHandover(data) {
    if (isMongoConnected) {
      try {
        await HandoverModel.create(data);
      } catch (e) {}
    }
    MemStore.handovers.push(data);
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
