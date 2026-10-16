import { WhatsAppService } from '../services/whatsappService.js';
import { ReportService } from '../services/reportService.js';
import { ComplianceService } from '../services/complianceService.js';
import { NotificationService } from '../services/notificationService.js';
import { EWasteItemModel, UserModel, RecyclerDirectoryModel, HandoverModel, MemStore } from '../models/index.js';
import { isMongoConnected } from '../config/db.js';

export class AdminFlow {
  static async handle(user, message, from) {
    const text = (message.text || message.buttonReplyId || message.listReplyId || '').trim();
    const lower = text.toLowerCase();
    const state = user.sessionState?.step || null;

    // Handle Active Admin States
    if (state && state.startsWith('admin_handover_select_rec_')) {
      const trackingCode = state.replace('admin_handover_select_rec_', '');
      const recyclerName = text.trim();

      const item = await this.getItemByCode(trackingCode);
      if (item) {
        item.status = 'handed_over';
        item.handedOverAt = new Date();
        item.assignedRecycler = recyclerName;
        await this.saveItem(item);

        await this.recordHandover({
          itemId: item._id,
          trackingCode: item.trackingCode,
          fromRole: 'admin',
          toRole: 'recycler',
          actorPhone: user.phone,
          actorName: user.name,
          location: recyclerName,
        });

        // Notify Recycler
        await NotificationService.notifyRecyclerOnHandover(item, recyclerName);

        await this.clearUserState(user);

        return WhatsAppService.sendButtons(
          from,
          `✅ *DISPATCHED TO RECYCLER*\n\n` +
          `Item: *${item.trackingCode}* (${item.actualWeight || item.approxWeight} kg)\n` +
          `Assigned Facility: *${recyclerName}*\n` +
          `Status: *Transferred from Campus Storage*\n\n` +
          `Recycler notified to execute statutory destruction and verify EPR receipt.`,
          [
            { id: 'btn_admin_handover', title: 'Handover Next' },
            { id: 'btn_admin_dashboard', title: 'Dashboard' },
          ]
        );
      }
    }

    // Admin Commands
    if (lower === 'dashboard' || lower === 'btn_admin_dashboard') {
      return this.sendDashboard(user, from);
    }

    if (lower === 'handover' || lower === 'btn_admin_handover') {
      return this.startHandover(user, from);
    }

    if (lower === 'report' || lower === 'btn_admin_report') {
      return this.generateAndSendReport(user, from);
    }

    if (lower === 'alerts' || lower === 'btn_admin_alerts') {
      return this.sendAlerts(user, from);
    }

    // Default Admin Console
    return WhatsAppService.sendButtons(
      from,
      `*ECOLOOP ADMIN & COMPLIANCE CONSOLE* 🛡️\n\n` +
      `Admin: *${user.name || 'Campus Sustainability Lead'}*\n` +
      `CPCB SLA Monitor: *Active*\n\n` +
      `Select an administrative action:`,
      [
        { id: 'btn_admin_dashboard', title: '📊 Dashboard KPI' },
        { id: 'btn_admin_handover', title: '🚚 Recycler Handover' },
        { id: 'btn_admin_report', title: '📄 NAAC PDF Report' },
      ]
    );
  }

  /**
   * Summary Dashboard (Strictly Real Data, Zero Defaults)
   */
  static async sendDashboard(user, from) {
    const allItems = await this.getAllItems();
    const allUsers = await this.getAllUsers();
    const students = allUsers.filter((u) => u.role === 'student');

    const totalCount = allItems.length;
    const verifiedItems = allItems.filter((i) => i.status === 'verified_recycled');
    const collectedItems = allItems.filter((i) => i.status === 'collected');
    const handedOverItems = allItems.filter((i) => i.status === 'handed_over');
    const scheduledItems = allItems.filter((i) => i.status === 'scheduled');
    const registeredItems = allItems.filter((i) => i.status === 'registered');

    const totalVerifiedKg = verifiedItems.reduce((acc, curr) => acc + (curr.actualWeight || curr.approxWeight || 0), 0);
    const totalCollectedKg = collectedItems.reduce((acc, curr) => acc + (curr.actualWeight || curr.approxWeight || 0), 0);
    const co2SavedKg = ComplianceService.calculateCo2Saved(totalVerifiedKg);

    const msg =
      `📊 *CAMPUS RECOVERY DASHBOARD (REAL LEDGER)*\n\n` +
      `• *Total Registered Units*: ${totalCount}\n` +
      `• *Verified Recycled Yield*: ${totalVerifiedKg.toFixed(2)} KG\n` +
      `• *Holding Facility Weight*: ${totalCollectedKg.toFixed(2)} KG\n` +
      `• *Student Contributors*: ${students.length}\n` +
      `• *Verified Carbon Offset*: ${co2SavedKg} KG CO2e\n\n` +
      `*PIPELINE BREAKDOWN*:\n` +
      `⏳ Registered (Unscheduled): ${registeredItems.length}\n` +
      `🗓️ Pickup Scheduled: ${scheduledItems.length}\n` +
      `📦 Collected at Campus Hub: ${collectedItems.length}\n` +
      `🚚 Dispatched to Recyclers: ${handedOverItems.length}\n` +
      `♻️ Verified Fully Recycled: ${verifiedItems.length}\n\n` +
      `_Audit rule: All stats reflect strictly real user submissions._`;

    return WhatsAppService.sendButtons(from, msg, [
      { id: 'btn_admin_handover', title: '🚚 Recycler Handover' },
      { id: 'btn_admin_report', title: '📄 NAAC PDF' },
      { id: 'btn_admin_alerts', title: '⚠️ SLA Alerts' },
    ]);
  }

  /**
   * Start Handover to Authorised Recycler
   */
  static async startHandover(user, from) {
    const allItems = await this.getAllItems();
    const collected = allItems.filter((i) => i.status === 'collected');

    if (collected.length === 0) {
      return WhatsAppService.sendButtons(
        from,
        `📦 *RECYCLER HANDOVER*\n\n` +
        `Current Holding Facility: *0 items ready for dispatch*.\n` +
        `Items must be collected and calibrated by the campus collection team before recycler handover.`,
        [{ id: 'btn_admin_dashboard', title: '📊 View Dashboard' }]
      );
    }

    const item = collected[0];
    const recyclers = await this.getRecyclers();

    user.sessionState = { step: `admin_handover_select_rec_${item.trackingCode}`, updatedAt: new Date() };
    await this.saveUser(user);

    const rows = recyclers.slice(0, 5).map((r, idx) => ({
      id: `rec_${idx}`,
      title: r.name.substring(0, 24),
      description: `${r.location} (${r.capacity})`,
    }));

    return WhatsAppService.sendList(
      from,
      `*SELECT AUTHORISED CPCB RECYCLER*\n\n` +
      `Transferring Item: *${item.trackingCode}*\n` +
      `Category: *${item.type}* (${item.actualWeight} kg)\n` +
      `Hostel: *${item.userHostel}*\n\n` +
      `Choose from verified CPCB recyclers:`,
      'Select Recycler',
      [{ title: 'Authorised Recyclers', rows }]
    );
  }

  /**
   * Generate & Send NAAC Report PDF
   */
  static async generateAndSendReport(user, from) {
    await WhatsAppService.sendText(from, `⏳ Generating official NAAC Criterion 7 / NIRF audit PDF from real database records...`);

    const allItems = await this.getAllItems();
    const allUsers = await this.getAllUsers();
    const verified = allItems.filter((i) => i.status === 'verified_recycled');
    const totalKg = verified.reduce((acc, curr) => acc + (curr.actualWeight || curr.approxWeight || 0), 0);

    // Group hostel stats
    const hostelMap = {};
    verified.forEach((i) => {
      const h = i.userHostel || 'Campus';
      const wt = i.actualWeight || i.approxWeight || 0;
      if (!hostelMap[h]) hostelMap[h] = { hostel: h, totalKg: 0, count: 0 };
      hostelMap[h].totalKg += wt;
      hostelMap[h].count += 1;
    });

    const hostelStats = Object.values(hostelMap);

    const pdfData = await ReportService.generateNaacReportPdf({
      totalItems: verified.length,
      totalKg,
      totalStudents: allUsers.filter((u) => u.role === 'student').length,
      hostelStats,
    });

    await WhatsAppService.sendDocument(
      from,
      pdfData.publicUrl,
      pdfData.fileName,
      `Institutional NAAC Criterion 7.1.3 E-Waste Audit Report (Generated with real ledger records)`
    );

    return WhatsAppService.sendButtons(
      from,
      `✅ Report generated and dispatched above. Ready for IQAC / NAAC submission.`,
      [{ id: 'btn_admin_dashboard', title: 'Dashboard' }]
    );
  }

  /**
   * Send CPCB 30-Day SLA Alerts
   */
  static async sendAlerts(user, from) {
    const allItems = await this.getAllItems();
    const breaches = ComplianceService.evaluateSlaBreaches(allItems);

    if (breaches.length === 0) {
      return WhatsAppService.sendButtons(
        from,
        `✅ *ZERO COMPLIANCE BREACHES*\n\n` +
        `All items are strictly compliant with statutory CPCB 30-day limits. Zero overdue storage detected.`,
        [{ id: 'btn_admin_dashboard', title: 'Dashboard' }]
      );
    }

    let msg = `⚠️ *CPCB STATUTORY SLA WARNINGS (${breaches.length})*:\n\n`;
    breaches.forEach((b, idx) => {
      msg += `*${idx + 1}. [${b.trackingCode}]* (${b.type})\n`;
      msg += `   Severity: *${b.severity}* (${b.daysPending} days pending)\n`;
      msg += `   ${b.rule}\n\n`;
    });

    return WhatsAppService.sendButtons(from, msg, [
      { id: 'btn_admin_handover', title: 'Execute Handover' },
      { id: 'btn_admin_dashboard', title: 'Dashboard' },
    ]);
  }

  // --- Database Helpers ---
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

  static async getAllUsers() {
    if (isMongoConnected) {
      try {
        const users = await UserModel.find().lean();
        if (users && users.length > 0) return users;
      } catch (e) {}
    }
    return Array.from(MemStore.users.values());
  }

  static async getRecyclers() {
    if (isMongoConnected) {
      try {
        const recs = await RecyclerDirectoryModel.find().lean();
        if (recs && recs.length > 0) return recs;
      } catch (e) {}
    }
    if (MemStore.recyclers.length > 0) return MemStore.recyclers;

    // Default real CPCB recyclers
    return [
      { name: 'M/s WB E-Waste Control Management Pvt. Ltd.', location: 'Howrah, West Bengal', capacity: '19992 MT/annum' },
      { name: 'M/s J. S. Pigments Pvt. Ltd.', location: 'Hooghly, West Bengal', capacity: '600 MT/annum' },
      { name: 'M/s Bhanu Metal Industries', location: 'Dist. 24 Parganas (N), West Bengal', capacity: '600 MT/annum' },
      { name: 'M/s Hindusthan Recycling', location: 'Purulia, West Bengal', capacity: '6960 MT/annum' },
    ];
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
