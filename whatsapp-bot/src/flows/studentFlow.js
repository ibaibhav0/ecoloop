import { WhatsAppService } from '../services/whatsappService.js';
import { QrService } from '../services/qrService.js';
import { NotificationService } from '../services/notificationService.js';
import { ComplianceService } from '../services/complianceService.js';
import { UserModel, EWasteItemModel, FeedbackModel, MemStore } from '../models/index.js';
import { isMongoConnected } from '../config/db.js';

export class StudentFlow {
  /**
   * Handle student commands and state transitions
   */
  static async handle(user, message, from) {
    const text = (message.text || message.buttonReplyId || message.listReplyId || '').trim();
    const lower = text.toLowerCase();
    const state = user.sessionState?.step || null;

    // Handle Active Multi-Step Registration / Creation States
    if (state) {
      const handled = await this.handleStateStep(user, message, state, text, lower);
      if (handled) return;
    }

    // Command Dispatcher
    if (lower === 'hi' || lower === 'hello' || lower === 'start') {
      return this.sendWelcome(user, from);
    }

    if (lower === 'register' || lower === 'btn_register') {
      return this.startItemRegistration(user, from);
    }

    if (lower === 'status' || lower === 'btn_status') {
      return this.sendStatusReport(user, from);
    }

    if (lower === 'points' || lower === 'btn_points' || lower === 'impact') {
      return this.sendPointsAndImpact(user, from);
    }

    if (lower === 'leaderboard' || lower === 'btn_leaderboard') {
      return this.sendLeaderboard(user, from);
    }

    if (lower === 'schedule' || lower === 'btn_schedule') {
      return this.startScheduleFlow(user, from);
    }

    if (lower === 'feedback' || lower === 'btn_feedback') {
      return this.startFeedbackFlow(user, from);
    }

    if (lower === 'help' || lower === 'btn_help') {
      return this.sendHelp(user, from);
    }

    // Default Fallback
    return WhatsAppService.sendButtons(
      from,
      `*ECOLOOP CAMPUS RECOVERY*\n\nCommand not recognized: "${text}".\nSelect a mission action below:`,
      [
        { id: 'btn_register', title: 'Register E-Waste' },
        { id: 'btn_status', title: 'Check Status' },
        { id: 'btn_help', title: 'Help & Commands' },
      ]
    );
  }

  /**
   * Send Welcome / Onboarding
   */
  static async sendWelcome(user, from) {
    if (!user.name) {
      await this.setUserState(user, 'onboarding_name');
      return WhatsAppService.sendText(
        from,
        `*WELCOME TO ECOLOOP CAMPUS SYSTEM* ♻️\n\n` +
        `Zero-landfill circular electronics reclamation protocol for student hostels and university labs.\n\n` +
        `To initialize your account, please reply with your *Full Name*:`
      );
    }

    return WhatsAppService.sendButtons(
      from,
      `*ECOLOOP MISSION CONSOLE* ⚡\n\n` +
      `Operator: *${user.name}*\n` +
      `Hostel Station: *${user.hostel}*\n` +
      `Verified Balance: *${user.points || 0} PTS*\n\n` +
      `Select an operation below:`,
      [
        { id: 'btn_register', title: '📦 Register E-Waste' },
        { id: 'btn_status', title: '🔍 My Items Status' },
        { id: 'btn_points', title: '🌿 Points & Impact' },
      ]
    );
  }

  /**
   * Multi-Step State Machine
   */
  static async handleStateStep(user, message, step, text, lower) {
    const from = user.phone;

    // 1. Onboarding Name
    if (step === 'onboarding_name') {
      user.name = text.trim();
      await this.setUserState(user, 'onboarding_email');
      await WhatsAppService.sendText(from, `Thank you, *${user.name}*. Now enter your *College Email Address*:`);
      return true;
    }

    // 2. Onboarding Email
    if (step === 'onboarding_email') {
      if (!text.includes('@')) {
        await WhatsAppService.sendText(from, `⚠️ Please provide a valid email address (e.g. name@campus.edu):`);
        return true;
      }
      user.email = text.trim().toLowerCase();
      await this.setUserState(user, 'onboarding_hostel');

      return WhatsAppService.sendList(
        from,
        `Select your *Campus Residence / Hostel Station*:`,
        'Select Hostel',
        [
          {
            title: 'Campus Hostels',
            rows: [
              { id: 'hostel_nandani', title: 'Nandani Hostel', description: 'Block A & B' },
              { id: 'hostel_saupernikha', title: 'Saupernikha Hostel', description: 'Main Wing' },
              { id: 'hostel_kumardhara', title: 'Kumardhara Hostel', description: 'North Block' },
              { id: 'hostel_netravati', title: 'Netravati Hostel', description: 'South Wing' },
              { id: 'hostel_dayscholar', title: 'Day Scholar', description: 'Campus Commuter' },
            ],
          },
        ]
      );
    }

    // 3. Onboarding Hostel
    if (step === 'onboarding_hostel') {
      let selectedHostel = 'Nandani';
      if (lower.includes('saupernikha')) selectedHostel = 'Saupernikha';
      else if (lower.includes('kumardhara')) selectedHostel = 'Kumardhara';
      else if (lower.includes('netravati')) selectedHostel = 'Netravati';
      else if (lower.includes('day') || lower.includes('scholar')) selectedHostel = 'Day Scholar';
      else if (text.length > 2) selectedHostel = text.trim();

      user.hostel = selectedHostel;
      await this.setUserState(user, 'onboarding_dept');
      await WhatsAppService.sendText(from, `Recorded hostel: *${user.hostel}*.\nNow enter your *Department* (e.g. CSE, ECE, Mechanical):`);
      return true;
    }

    // 4. Onboarding Department
    if (step === 'onboarding_dept') {
      user.department = text.trim() || 'Engineering';
      await this.setUserState(user, null);
      await this.saveUser(user);

      await WhatsAppService.sendButtons(
        from,
        `✅ *REGISTRATION INITIALIZED*\n\n` +
        `Name: *${user.name}*\n` +
        `Hostel: *${user.hostel}*\n` +
        `Department: *${user.department}*\n` +
        `Role: *Student Contributor*\n\n` +
        `You are now authorized to register e-waste and earn verified carbon reward points!`,
        [
          { id: 'btn_register', title: 'Register E-Waste' },
          { id: 'btn_help', title: 'Help & Commands' },
        ]
      );
      return true;
    }

    // 5. Item Registration: Step 1 (Category Selection)
    if (step === 'register_type') {
      const draft = user.sessionState?.draftItem || {};
      draft.type = text.trim();
      await this.setUserState(user, 'register_weight', draft);

      await WhatsAppService.sendText(
        from,
        `Selected Category: *${draft.type}*.\n\n` +
        `Enter the *approximate weight in KG* (e.g. 0.3 for a phone, 2.2 for a laptop, 0.15 for charger):`
      );
      return true;
    }

    // 6. Item Registration: Step 2 (Approximate Weight)
    if (step === 'register_weight') {
      const weight = parseFloat(text.replace(/[^0-9.]/g, ''));
      if (isNaN(weight) || weight <= 0) {
        await WhatsAppService.sendText(from, `⚠️ Please enter a numeric weight value in kg (e.g. 0.5 or 2):`);
        return true;
      }

      const draft = user.sessionState?.draftItem || {};
      draft.approxWeight = weight;
      await this.setUserState(user, 'register_photo', draft);

      await WhatsAppService.sendText(
        from,
        `Weight recorded: *${weight} kg*.\n\n` +
        `📷 *Optional Photo*: Send a photo of the electronic item now, or reply with *"Skip"* to proceed directly to QR code generation.`
      );
      return true;
    }

    // 7. Item Registration: Step 3 (Optional Photo & Finalize)
    if (step === 'register_photo') {
      const draft = user.sessionState?.draftItem || {};
      let photoUrl = '';

      if (message.type === 'image' && message.image?.id) {
        photoUrl = `https://whatsapp-media-id/${message.image.id}`;
      }

      // Generate Unique Serialized Tracking Code
      const randHex = Math.random().toString(36).substring(2, 6).toUpperCase();
      const yearMonth = new Date().toISOString().slice(0, 7).replace('-', '');
      const trackingCode = `ECL-${yearMonth}-${randHex}`;

      // Generate Cryptographic QR code image
      const qrData = await QrService.generateItemQrCode(trackingCode, {
        type: draft.type || 'Other Electronics',
        userHostel: user.hostel,
      });

      // Save Item in Database (CRITICAL: Pure real data entered by student)
      const newItem = {
        trackingCode,
        userId: user._id,
        userPhone: user.phone,
        userName: user.name,
        userHostel: user.hostel,
        type: draft.type || 'Other Electronics',
        approxWeight: draft.approxWeight || 0.5,
        photoUrl,
        qrCodeData: trackingCode,
        qrCodeUrl: qrData.publicUrl,
        status: 'registered',
      };

      await this.saveItem(newItem);
      await this.setUserState(user, null);

      // Send confirmation & QR code image to student
      await WhatsAppService.sendText(
        from,
        `✅ *ITEM REGISTERED SUCCESSFULLY*\n\n` +
        `Tracking Code: *${trackingCode}*\n` +
        `Category: *${newItem.type}*\n` +
        `Approx Weight: *${newItem.approxWeight} kg*\n` +
        `Hostel: *${user.hostel}*\n\n` +
        `Generating your cryptographic QR passport...`
      );

      // Send the QR code as an image directly to the chat
      await WhatsAppService.sendImage(
        from,
        qrData.publicUrl,
        `ECOLOOP QR PASSPORT // ${trackingCode}\nAttach this code to your hardware or show it upon pickup.`
      );

      // Prompt to Schedule pickup
      await WhatsAppService.sendButtons(
        from,
        `Would you like to schedule a pickup or drop-off for *${trackingCode}* now?`,
        [
          { id: `sched_${trackingCode}`, title: '🗓️ Schedule Pickup' },
          { id: 'btn_status', title: '🔍 My Manifest' },
        ]
      );
      return true;
    }

    // 8. Schedule Pickup Flow
    if (step.startsWith('scheduling_slot_')) {
      const trackingCode = step.replace('scheduling_slot_', '');
      const item = await this.getItemByCode(trackingCode);

      if (!item) {
        await WhatsAppService.sendText(from, `Item not found. Send *"Status"* to review active items.`);
        await this.setUserState(user, null);
        return true;
      }

      item.pickupDate = text.trim();
      item.location = user.hostel || 'Hostel Reception';
      item.status = 'scheduled';
      await this.saveItem(item);
      await this.setUserState(user, null);

      // Notify Collection Team
      await NotificationService.notifyCollectionTeamOnSchedule(item);

      await WhatsAppService.sendButtons(
        from,
        `🗓️ *PICKUP CONFIRMED*\n\n` +
        `Tracking Code: *${item.trackingCode}*\n` +
        `Slot: *${item.pickupDate}*\n` +
        `Location: *${item.location}*\n\n` +
        `Our campus collection team has been notified. Keep the QR code ready!`,
        [
          { id: 'btn_status', title: 'Check Status' },
          { id: 'btn_register', title: 'Register Another' },
        ]
      );
      return true;
    }

    // 9. Feedback Rating Flow
    if (step === 'feedback_rating') {
      const rating = parseInt(text.replace(/[^1-5]/g, ''), 10);
      if (isNaN(rating) || rating < 1 || rating > 5) {
        await WhatsAppService.sendText(from, `Please reply with a rating from *1* (poor) to *5* (excellent):`);
        return true;
      }

      await this.setUserState(user, `feedback_comment_${rating}`);
      await WhatsAppService.sendText(from, `Rated *${rating}/5* ⭐. Any short comment or suggestion? (Or reply *"None"*):`);
      return true;
    }

    if (step.startsWith('feedback_comment_')) {
      const rating = parseInt(step.replace('feedback_comment_', ''), 10) || 5;
      const comment = text.trim() === 'none' ? '' : text.trim();

      await this.saveFeedback({
        userPhone: user.phone,
        rating,
        comment,
      });
      await this.setUserState(user, null);

      await WhatsAppService.sendText(
        from,
        `🙏 Thank you for your feedback! It helps keep our campus recovery operations smooth and reliable.`
      );
      return true;
    }

    return false;
  }

  /**
   * Start Item Registration
   */
  static async startItemRegistration(user, from) {
    await this.setUserState(user, 'register_type', {});

    return WhatsAppService.sendList(
      from,
      `*REGISTER NEW E-WASTE ITEM*\n\nSelect the equipment category from the list below:`,
      'Select Category',
      [
        {
          title: 'Computing & Mobile',
          rows: [
            { id: 'cat_laptop', title: 'Laptop / Computer', description: 'Laptops, notebooks, PC towers' },
            { id: 'cat_mobile', title: 'Mobile Phone / Tablet', description: 'Smartphones, iPads, tablets' },
            { id: 'cat_charger', title: 'Charger & Cables', description: 'Power bricks, USB cords, HDMI' },
          ],
        },
        {
          title: 'Components & Other',
          rows: [
            { id: 'cat_battery', title: 'Battery / Power Bank', description: 'Li-ion cells, portable banks' },
            { id: 'cat_pcb', title: 'Circuit Board / PCB', description: 'Motherboards, project boards' },
            { id: 'cat_monitor', title: 'Monitor / TV Display', description: 'LCD/LED screens' },
            { id: 'cat_lab', title: 'Lab Equipment', description: 'Oscilloscopes, meters, power rigs' },
            { id: 'cat_other', title: 'Other Electronics', description: 'Peripherals, earphones, calculators' },
          ],
        },
      ]
    );
  }

  /**
   * Start Schedule Flow
   */
  static async startScheduleFlow(user, from) {
    const items = await this.getItemsByUser(user.phone);
    const unscheduled = items.filter((i) => i.status === 'registered');

    if (unscheduled.length === 0) {
      return WhatsAppService.sendButtons(
        from,
        `You have no unscheduled items. Register a new item first:`,
        [
          { id: 'btn_register', title: 'Register E-Waste' },
          { id: 'btn_status', title: 'Check Status' },
        ]
      );
    }

    const itemToSchedule = unscheduled[0];
    await this.setUserState(user, `scheduling_slot_${itemToSchedule.trackingCode}`);

    return WhatsAppService.sendText(
      from,
      `🗓️ *SCHEDULE PICKUP FOR ${itemToSchedule.trackingCode}* (${itemToSchedule.type})\n\n` +
      `Reply with your preferred date, time, and hostel location.\n` +
      `_Example: "Tomorrow at 4:30 PM, Nandani Block B Reception"_`
    );
  }

  /**
   * Status Report (Strictly Real Data)
   */
  static async sendStatusReport(user, from) {
    const items = await this.getItemsByUser(user.phone);

    if (items.length === 0) {
      return WhatsAppService.sendButtons(
        from,
        `📋 *YOUR E-WASTE MANIFEST*\n\n` +
        `Total Items: *0*\n` +
        `Verified Weight: *0.00 kg*\n\n` +
        `You have not registered any electronics yet. Send *"Register"* to log your first item.`,
        [
          { id: 'btn_register', title: '📦 Register Item' },
          { id: 'btn_help', title: '❓ Help' },
        ]
      );
    }

    let report = `📋 *YOUR SERIALIZED MANIFEST (${items.length} Units)*:\n\n`;

    items.forEach((item, idx) => {
      const statusIcon =
        item.status === 'verified_recycled'
          ? '♻️ RECYCLED'
          : item.status === 'handed_over'
          ? '🚚 IN TRANSIT TO RECYCLER'
          : item.status === 'collected'
          ? '📦 COLLECTED AT CAMPUS HUB'
          : item.status === 'scheduled'
          ? '🗓️ PICKUP SCHEDULED'
          : '⏳ REGISTERED';

      const weight = item.actualWeight ? `${item.actualWeight} kg (calibrated)` : `~${item.approxWeight} kg (approx)`;
      report += `*${idx + 1}. [${item.trackingCode}]* - ${item.type}\n`;
      report += `   Weight: ${weight}\n`;
      report += `   Status: *${statusIcon}*\n`;
      if (item.pickupDate) report += `   Slot: ${item.pickupDate}\n`;
      report += `\n`;
    });

    return WhatsAppService.sendButtons(from, report, [
      { id: 'btn_register', title: 'Register New' },
      { id: 'btn_points', title: 'View Points' },
    ]);
  }

  /**
   * Points and Personal Impact Card
   */
  static async sendPointsAndImpact(user, from) {
    const items = await this.getItemsByUser(user.phone);
    const verifiedItems = items.filter((i) => i.status === 'verified_recycled');
    const totalVerifiedKg = verifiedItems.reduce((acc, curr) => acc + (curr.actualWeight || curr.approxWeight || 0), 0);
    const co2SavedKg = ComplianceService.calculateCo2Saved(totalVerifiedKg);
    const points = user.points || 0;

    const message =
      `🌿 *PERSONAL CIRCULAR IMPACT CARD*\n\n` +
      `Operator: *${user.name}*\n` +
      `Hostel: *${user.hostel}*\n` +
      `---------------------------------\n` +
      `💎 *Reward Points*: *${points} PTS*\n` +
      `⚖️ *Verified Hardware Reclaimed*: *${totalVerifiedKg.toFixed(2)} KG*\n` +
      `🌱 *CO2e Emissions Avoided*: *${co2SavedKg} KG*\n` +
      `📦 *Total Submissions*: *${items.length} units*\n` +
      `---------------------------------\n` +
      `_Formula: 10 PTS / verified KG • 1 kg e-waste saves 1.44 kg CO2e._`;

    return WhatsAppService.sendButtons(from, message, [
      { id: 'btn_leaderboard', title: '🏆 Leaderboard' },
      { id: 'btn_register', title: '📦 Register Item' },
    ]);
  }

  /**
   * Hostel Leaderboard (Pure Real Data)
   */
  static async sendLeaderboard(user, from) {
    const allItems = await this.getAllItems();
    const verifiedItems = allItems.filter((i) => i.status === 'verified_recycled');

    if (verifiedItems.length === 0) {
      return WhatsAppService.sendButtons(
        from,
        `🏆 *HOSTEL CIRCULAR LEADERBOARD*\n\n` +
        `Total Verified E-Waste: *0.00 KG*\n\n` +
        `No items have completed the recycling pipeline yet. Register hardware to lead your hostel to #1!`,
        [
          { id: 'btn_register', title: '📦 Register Item' },
          { id: 'btn_status', title: '🔍 My Items' },
        ]
      );
    }

    // Group by hostel
    const hostelMap = {};
    verifiedItems.forEach((i) => {
      const h = i.userHostel || 'Other';
      const wt = i.actualWeight || i.approxWeight || 0;
      hostelMap[h] = (hostelMap[h] || 0) + wt;
    });

    const sorted = Object.entries(hostelMap).sort((a, b) => b[1] - a[1]);

    let msg = `🏆 *CAMPUS HOSTEL LEADERBOARD (REAL DATA)*\n\n`;
    sorted.forEach(([hostel, wt], idx) => {
      const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '🔹';
      msg += `${medal} *#${idx + 1} ${hostel}*: ${wt.toFixed(2)} KG\n`;
    });
    msg += `\n_Rankings update in real-time as authorized recyclers verify deliveries._`;

    return WhatsAppService.sendButtons(from, msg, [
      { id: 'btn_register', title: '📦 Register Item' },
      { id: 'btn_points', title: '🌿 My Points' },
    ]);
  }

  /**
   * Feedback Flow
   */
  static async startFeedbackFlow(user, from) {
    await this.setUserState(user, 'feedback_rating');
    return WhatsAppService.sendText(
      from,
      `⭐ *FEEDBACK & SERVICE RATING*\n\n` +
      `How would you rate your recent EcoLoop campus collection?\n` +
      `Reply with a single number from *1* to *5*:`
    );
  }

  /**
   * Help Command
   */
  static async sendHelp(user, from) {
    const helpMsg =
      `ℹ️ *ECOLOOP WHATSAPP BOT COMMANDS*\n\n` +
      `• *"Register"* - Register a new e-waste item\n` +
      `• *"Schedule"* - Book a pickup or drop-off slot\n` +
      `• *"Status"* - View live status of all registered items\n` +
      `• *"Points"* - View your reward points and CO2 saved\n` +
      `• *"Leaderboard"* - View hostel standings\n` +
      `• *"Feedback"* - Rate your collection experience\n` +
      `• *"Help"* - Display this help manual\n\n` +
      `_Status Pipeline: Registered ➔ Scheduled ➔ Collected ➔ Handed Over ➔ Verified Recycled._`;

    return WhatsAppService.sendButtons(from, helpMsg, [
      { id: 'btn_register', title: 'Register Item' },
      { id: 'btn_status', title: 'My Status' },
    ]);
  }

  // --- Database Helpers ---
  static async setUserState(user, step, draftItem = {}) {
    user.sessionState = { step, draftItem, updatedAt: new Date() };
    await this.saveUser(user);
  }

  static async saveUser(user) {
    if (isMongoConnected) {
      try {
        if (user.save) await user.save();
      } catch (e) {}
    }
    MemStore.users.set(user.phone, user);
  }

  static async saveItem(item) {
    if (isMongoConnected) {
      try {
        await EWasteItemModel.findOneAndUpdate({ trackingCode: item.trackingCode }, item, { upsert: true });
      } catch (e) {}
    }
    MemStore.items.set(item.trackingCode, item);
  }

  static async getItemByCode(code) {
    if (isMongoConnected) {
      try {
        const item = await EWasteItemModel.findOne({ trackingCode: code }).lean();
        if (item) return item;
      } catch (e) {}
    }
    return MemStore.items.get(code) || null;
  }

  static async getItemsByUser(phone) {
    if (isMongoConnected) {
      try {
        const items = await EWasteItemModel.find({ userPhone: phone }).sort({ createdAt: -1 }).lean();
        if (items && items.length > 0) return items;
      } catch (e) {}
    }
    return Array.from(MemStore.items.values()).filter((i) => i.userPhone === phone);
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

  static async saveFeedback(data) {
    if (isMongoConnected) {
      try {
        await FeedbackModel.create(data);
      } catch (e) {}
    }
    MemStore.feedbacks.push(data);
  }
}
