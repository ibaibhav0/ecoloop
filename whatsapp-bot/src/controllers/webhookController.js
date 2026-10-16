import { metaConfig } from '../config/metaConfig.js';
import { WhatsAppService } from '../services/whatsappService.js';
import { StudentFlow } from '../flows/studentFlow.js';
import { CollectorFlow } from '../flows/collectorFlow.js';
import { AdminFlow } from '../flows/adminFlow.js';
import { RecyclerFlow } from '../flows/recyclerFlow.js';
import { UserModel, MemStore } from '../models/index.js';

import { isMongoConnected } from '../config/db.js';

export class WebhookController {
  /**
   * Meta Webhook Verification Handler (GET /webhook)
   */
  static verifyWebhook(req, res) {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === metaConfig.verifyToken) {
      console.log('✅ [Webhook Verification] Meta challenge verified successfully.');
      return res.status(200).send(challenge);
    } else {
      console.warn('❌ [Webhook Verification] Token mismatch or invalid mode.');
      return res.status(403).json({ error: 'Verification failed: token mismatch' });
    }
  }

  /**
   * Incoming WhatsApp Messages Handler (POST /webhook)
   */
  static async handleIncoming(req, res) {
    // 1. Immediately acknowledge HTTP 200 to Meta to prevent retries
    res.status(200).send('EVENT_RECEIVED');

    try {
      const body = req.body;
      if (body.object !== 'whatsapp_business_account') {
        return;
      }

      const entries = body.entry || [];
      for (const entry of entries) {
        const changes = entry.changes || [];
        for (const change of changes) {
          const value = change.value;
          if (!value || !value.messages || value.messages.length === 0) {
            continue;
          }

          const contact = value.contacts?.[0] || {};
          const senderName = contact.profile?.name || '';

          for (const rawMessage of value.messages) {
            await WebhookController.processSingleMessage(rawMessage, senderName);
          }
        }
      }
    } catch (err) {
      console.error('❌ [Webhook Ingestion Error]:', err);
    }
  }

  /**
   * Process individual incoming message
   */
  static async processSingleMessage(msg, profileName = '') {
    const from = msg.from;
    const msgType = msg.type;

    // Normalize message content
    const message = {
      id: msg.id,
      from,
      type: msgType,
      text: '',
      buttonReplyId: '',
      listReplyId: '',
      image: null,
      timestamp: msg.timestamp,
    };

    if (msgType === 'text') {
      message.text = msg.text?.body || '';
    } else if (msgType === 'interactive') {
      const interactive = msg.interactive || {};
      if (interactive.type === 'button_reply') {
        message.buttonReplyId = interactive.button_reply?.id || '';
        message.text = interactive.button_reply?.title || message.buttonReplyId;
      } else if (interactive.type === 'list_reply') {
        message.listReplyId = interactive.list_reply?.id || '';
        message.text = interactive.list_reply?.title || message.listReplyId;
      }
    } else if (msgType === 'image') {
      message.image = msg.image;
      message.text = msg.image?.caption || '';
    }

    console.log(`\n📥 [Incoming WhatsApp] From: ${from} | Type: ${msgType} | Text: "${message.text}"`);

    // Fetch or create user
    const user = await WebhookController.getOrCreateUser(from, profileName);

    // Support Role Switching Command for convenient pairing / testing
    const trimmed = message.text.trim().toUpperCase();
    if (trimmed.startsWith('ROLE ')) {
      const targetRole = trimmed.replace('ROLE ', '').toLowerCase();
      if (['student', 'collection', 'admin', 'recycler'].includes(targetRole)) {
        user.role = targetRole;
        await user.save?.();
        MemStore.users.set(user.phone, user);

        await WhatsAppService.sendText(
          from,
          `🔄 *ROLE SWITCHED*\n\nYour active session role is now: *${targetRole.toUpperCase()}*.\nSend *"Hi"* or *"Help"* to see your new console.`
        );
        return;
      }
    }

    // Role-based Router
    switch (user.role) {
      case 'collection':
        return CollectorFlow.handle(user, message, from);
      case 'admin':
        return AdminFlow.handle(user, message, from);
      case 'recycler':
        return RecyclerFlow.handle(user, message, from);
      case 'student':
      default:
        return StudentFlow.handle(user, message, from);
    }
  }

  /**
   * Database User Loader with Memory Fallback
   */
  static async getOrCreateUser(phone, profileName = '') {
    let user = null;
    if (isMongoConnected) {
      try {
        user = await UserModel.findOne({ phone });
      } catch (e) {}
    }

    if (!user) {
      user = MemStore.users.get(phone);
    }

    if (!user) {
      user = {
        phone,
        name: profileName || '',
        email: '',
        role: 'student',
        hostel: 'Nandani',
        department: 'Computer Science',
        points: 0,
        sessionState: { step: null, draftItem: {}, updatedAt: new Date() },
      };

      if (isMongoConnected) {
        try {
          const created = await UserModel.create(user);
          user = created;
        } catch (e) {}
      }
      MemStore.users.set(phone, user);
    }

    return user;
  }
}
