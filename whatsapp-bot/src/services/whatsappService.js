import axios from 'axios';
import { metaConfig } from '../config/metaConfig.js';
import fs from 'fs';
import path from 'path';

export class WhatsAppService {
  /**
   * Helper to execute Graph API request or log simulation
   */
  static async postMessage(payload) {
    if (!metaConfig.accessToken || !metaConfig.phoneNumberId) {
      console.log(`\n💬 [WhatsApp Simulation -> ${payload.to}]:`, JSON.stringify(payload, null, 2));
      return { success: true, simulated: true };
    }

    try {
      const response = await axios.post(metaConfig.graphApiUrl, payload, {
        headers: {
          Authorization: `Bearer ${metaConfig.accessToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      });
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.error?.message || err.message;
      console.error(`❌ [WhatsApp API Error]:`, errorMsg);
      return { success: false, error: errorMsg };
    }
  }

  /**
   * Send plain or formatted text message
   */
  static async sendText(to, text, previewUrl = false) {
    return this.postMessage({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: this.formatPhoneNumber(to),
      type: 'text',
      text: { body: text, preview_url: previewUrl },
    });
  }

  /**
   * Send interactive Quick Reply buttons (up to 3 buttons)
   */
  static async sendButtons(to, bodyText, buttons, headerText = null, footerText = 'EcoLoop Campus Protocol') {
    const formattedButtons = buttons.slice(0, 3).map((btn, idx) => ({
      type: 'reply',
      reply: {
        id: btn.id || `btn_${idx}`,
        title: (btn.title || btn.label).substring(0, 20),
      },
    }));

    const interactive = {
      type: 'button',
      body: { text: bodyText },
      action: { buttons: formattedButtons },
    };

    if (headerText) {
      interactive.header = { type: 'text', text: headerText };
    }
    if (footerText) {
      interactive.footer = { text: footerText };
    }

    return this.postMessage({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: this.formatPhoneNumber(to),
      type: 'interactive',
      interactive,
    });
  }

  /**
   * Send interactive List menu (up to 10 items)
   */
  static async sendList(to, bodyText, buttonText, sections, headerText = null, footerText = 'EcoLoop Campus Protocol') {
    const interactive = {
      type: 'list',
      header: headerText ? { type: 'text', text: headerText } : undefined,
      body: { text: bodyText },
      footer: footerText ? { text: footerText } : undefined,
      action: {
        button: buttonText.substring(0, 20),
        sections,
      },
    };

    return this.postMessage({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: this.formatPhoneNumber(to),
      type: 'interactive',
      interactive,
    });
  }

  /**
   * Send Image message via publicly accessible URL
   */
  static async sendImage(to, imageUrl, caption = null) {
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: this.formatPhoneNumber(to),
      type: 'image',
      image: { link: imageUrl },
    };
    if (caption) {
      payload.image.caption = caption;
    }
    return this.postMessage(payload);
  }

  /**
   * Send Document (PDF report / certificate) via URL
   */
  static async sendDocument(to, documentUrl, filename, caption = null) {
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: this.formatPhoneNumber(to),
      type: 'document',
      document: {
        link: documentUrl,
        filename: filename || 'EcoLoop-Document.pdf',
      },
    };
    if (caption) {
      payload.document.caption = caption;
    }
    return this.postMessage(payload);
  }

  /**
   * Download incoming media (e.g. photo of e-waste or photo of QR code)
   */
  static async downloadMedia(mediaId) {
    if (!metaConfig.accessToken) {
      console.log(`⚠️ [WhatsApp Media] No access token provided. Returning null.`);
      return null;
    }

    try {
      // 1. Get media URL from Graph API
      const metaRes = await axios.get(`https://graph.facebook.com/${metaConfig.apiVersion}/${mediaId}`, {
        headers: { Authorization: `Bearer ${metaConfig.accessToken}` },
      });

      const mediaUrl = metaRes.data?.url;
      if (!mediaUrl) return null;

      // 2. Fetch binary buffer
      const fileRes = await axios.get(mediaUrl, {
        headers: { Authorization: `Bearer ${metaConfig.accessToken}` },
        responseType: 'arraybuffer',
      });

      return Buffer.from(fileRes.data);
    } catch (err) {
      console.error(`❌ [WhatsApp Media Download Error]:`, err.message);
      return null;
    }
  }

  /**
   * Sanitize phone number (strip spaces, symbols, plus)
   */
  static formatPhoneNumber(phone) {
    if (!phone) return '';
    return String(phone).replace(/[^0-9]/g, '');
  }
}
