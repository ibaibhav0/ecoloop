import QRCode from 'qrcode';
import Jimp from 'jimp';
import jsQR from 'jsqr';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { metaConfig } from '../config/metaConfig.js';

const QR_DIR = path.resolve('public/qr');
if (!fs.existsSync(QR_DIR)) {
  fs.mkdirSync(QR_DIR, { recursive: true });
}

export class QrService {
  /**
   * Generate QR Code PNG for an item and return both public URL & local file path
   */
  static async generateItemQrCode(trackingCode, itemData = {}) {
    const fileName = `${trackingCode}.png`;
    const filePath = path.join(QR_DIR, fileName);

    const payload = JSON.stringify({
      protocol: 'ECOLOOP_CPCB_2022',
      trackingCode,
      type: itemData.type || 'E-Waste',
      hostel: itemData.userHostel || 'Campus',
      timestamp: new Date().toISOString(),
    });

    // Generate high-resolution, high-contrast QR code with margin
    await QRCode.toFile(filePath, payload, {
      errorCorrectionLevel: 'H',
      type: 'png',
      margin: 2,
      width: 480,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    const publicUrl = `${metaConfig.baseUrl}/qr/${fileName}`;
    const dataUri = await QRCode.toDataURL(payload, { width: 300 });

    return {
      filePath,
      fileName,
      publicUrl,
      dataUri,
    };
  }

  /**
   * Decode QR Code from an image buffer using Jimp + jsQR
   */
  static async decodeQrFromImageBuffer(imageBuffer) {
    if (!imageBuffer || imageBuffer.length === 0) {
      return null;
    }

    try {
      // 1. Pure JS image rasterization with Jimp
      const image = await Jimp.read(imageBuffer);
      const width = image.bitmap.width;
      const height = image.bitmap.height;
      const rawData = new Uint8ClampedArray(image.bitmap.data);

      // 2. Scan with jsQR
      const qrCode = jsQR(rawData, width, height, {
        inversionAttempts: 'attemptBoth',
      });

      if (qrCode && qrCode.data) {
        return this.parseQrPayload(qrCode.data);
      }

      // If first attempt misses, try slight contrast enhancement
      image.greyscale().contrast(0.4);
      const enhancedData = new Uint8ClampedArray(image.bitmap.data);
      const retryCode = jsQR(enhancedData, width, height, { inversionAttempts: 'attemptBoth' });

      if (retryCode && retryCode.data) {
        return this.parseQrPayload(retryCode.data);
      }

      // 3. Fallback to OpenAI Vision API if configured
      if (metaConfig.openAiApiKey) {
        const visionResult = await this.decodeWithOpenAiVision(imageBuffer);
        if (visionResult) return visionResult;
      }

      return null;
    } catch (err) {
      console.warn(`⚠️ [QR Decoder Warning]:`, err.message);
      return null;
    }
  }

  /**
   * Extract tracking code from parsed string or JSON
   */
  static parseQrPayload(rawText) {
    if (!rawText) return null;

    try {
      // If JSON payload
      if (rawText.trim().startsWith('{')) {
        const parsed = JSON.parse(rawText);
        if (parsed.trackingCode) return parsed.trackingCode.toUpperCase().trim();
      }
    } catch (e) {
      // Not JSON, continue to regex
    }

    // Match ECL-XXXX-XXXX or direct tracking code pattern
    const match = rawText.match(/ECL-[A-Z0-9]+-[A-Z0-9]+/i) || rawText.match(/ECL-[A-Z0-9]+/i);
    if (match) {
      return match[0].toUpperCase().trim();
    }

    return rawText.trim();
  }

  /**
   * Optional OpenAI Vision fallback for distorted camera photos
   */
  static async decodeWithOpenAiVision(imageBuffer) {
    try {
      const base64Image = imageBuffer.toString('base64');
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'You are an expert QR code reader. Inspect the image and extract the EcoLoop tracking code or QR text payload. Return ONLY the tracking code string (e.g. ECL-202610-ABCD). If none found, return NONE.',
            },
            {
              role: 'user',
              content: [
                {
                  type: 'image_url',
                  image_url: { url: `data:image/jpeg;base64,${base64Image}` },
                },
              ],
            },
          ],
          max_tokens: 30,
        },
        {
          headers: {
            Authorization: `Bearer ${metaConfig.openAiApiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 12000,
        }
      );

      const reply = response.data?.choices?.[0]?.message?.content?.trim();
      if (reply && reply !== 'NONE') {
        return this.parseQrPayload(reply);
      }
      return null;
    } catch (err) {
      console.warn(`⚠️ [OpenAI Vision Fallback Warning]:`, err.message);
      return null;
    }
  }
}
