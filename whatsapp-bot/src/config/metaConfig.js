import dotenv from 'dotenv';
dotenv.config();

export const metaConfig = {
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
  verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || 'ecoloop_mission_verify_token_2026',
  appSecret: process.env.WHATSAPP_APP_SECRET || '',
  apiVersion: 'v21.0',
  baseUrl: process.env.BASE_URL || `http://localhost:${process.env.PORT || 5001}`,
  graphApiUrl: `https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_NUMBER_ID || 'dummy_id'}/messages`,
  openAiApiKey: process.env.OPENAI_API_KEY || '',
  cpcbPortalUrl: process.env.CPCB_PORTAL_URL || 'https://eprewastecpcb.in',
  campusName: process.env.CAMPUS_NAME || 'Nitte Deemed to be University',
};
