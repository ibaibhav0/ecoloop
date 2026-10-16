import express from 'express';
import { EWasteItemModel, UserModel, RecyclerDirectoryModel, MemStore } from '../models/index.js';
import { WebhookController } from '../controllers/webhookController.js';
import mongoose from 'mongoose';

const router = express.Router();

/**
 * Health Check Endpoint (Render & Monitor)
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'EcoLoop WhatsApp Bot',
    protocol: 'CPCB 2022 Statutory E-Waste Circular Protocol',
    dbState: mongoose.connection.readyState === 1 ? 'connected' : 'in-memory-resilience',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Official CPCB Recycler Directory Endpoint
 */
router.get('/recyclers', async (req, res) => {
  try {
    let recyclers = await RecyclerDirectoryModel.find().lean();
    if (!recyclers || recyclers.length === 0) {
      recyclers = MemStore.recyclers;
    }
    res.status(200).json({ success: true, count: recyclers.length, recyclers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Live Stats (Strictly Real Data, Defaults to 0)
 */
router.get('/stats', async (req, res) => {
  try {
    let items = [];
    try {
      items = await EWasteItemModel.find().lean();
    } catch (e) {
      items = Array.from(MemStore.items.values());
    }

    const verified = items.filter((i) => i.status === 'verified_recycled');
    const totalVerifiedKg = verified.reduce((acc, curr) => acc + (curr.actualWeight || curr.approxWeight || 0), 0);
    const co2AvoidedKg = parseFloat((totalVerifiedKg * 1.44).toFixed(2));

    res.status(200).json({
      success: true,
      data: {
        totalItemsRegistered: items.length,
        totalVerifiedRecycledUnits: verified.length,
        totalVerifiedWeightKg: totalVerifiedKg,
        totalCo2AvoidedKg: co2AvoidedKg,
        activeCampuses: 1,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Developer Interactive Simulator Endpoint (POST /api/simulate-message)
 */
router.post('/simulate-message', async (req, res) => {
  const { from = '919876543210', text = 'Hi', profileName = 'Student Contributor', type = 'text', imageId = null } = req.body;

  try {
    const rawMsg = {
      id: `sim_${Date.now()}`,
      from,
      type,
      text: { body: text },
      image: imageId ? { id: imageId } : undefined,
      timestamp: String(Math.floor(Date.now() / 1000)),
    };

    await WebhookController.processSingleMessage(rawMsg, profileName);
    res.status(200).json({ success: true, message: 'Simulated event processed successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
