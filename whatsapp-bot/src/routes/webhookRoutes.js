import express from 'express';
import { WebhookController } from '../controllers/webhookController.js';

const router = express.Router();

// Meta Webhook Verification (GET /webhook)
router.get('/', WebhookController.verifyWebhook);

// Meta Incoming Event Handler (POST /webhook)
router.post('/', WebhookController.handleIncoming);

export default router;
