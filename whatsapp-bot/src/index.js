import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from './config/db.js';
import { metaConfig } from './config/metaConfig.js';
import webhookRoutes from './routes/webhookRoutes.js';
import apiRoutes from './routes/apiRoutes.js';
import { seedDatabase } from './seed.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Global Middleware
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Serve static QR codes & generated PDF reports to WhatsApp
app.use('/qr', express.static(path.resolve('public/qr')));
app.use('/reports', express.static(path.resolve('public/reports')));

// Mount Meta Webhook & Public API routes
app.use('/webhook', webhookRoutes);
app.use('/api', apiRoutes);

// Root Welcome Banner (SpaceX aesthetic)
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>EcoLoop WhatsApp Bot • Campus Circular Platform</title>
      <style>
        body {
          background-color: #000000;
          color: #F0F0FA;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          margin: 0;
          padding: 60px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        h1 {
          font-size: 2.8rem;
          text-transform: uppercase;
          letter-spacing: 4px;
          margin: 0 0 8px 0;
          color: #FFFFFF;
        }
        .caption {
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #888891;
          margin-bottom: 32px;
        }
        .card {
          border: 1px solid #27272A;
          background: #09090B;
          padding: 32px;
          max-width: 600px;
          width: 100%;
          border-radius: 4px;
          text-align: left;
        }
        .badge {
          display: inline-block;
          padding: 4px 10px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          font-size: 0.75rem;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          margin-bottom: 16px;
        }
        pre {
          background: #000;
          padding: 12px;
          border: 1px solid #1F1F23;
          font-size: 0.8rem;
          color: #10B981;
          overflow-x: auto;
        }
        a {
          color: #FFFFFF;
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="badge">ECOLOOP WHATSAPP ENGINE // ACTIVE</div>
      <h1>ECOLOOP BOT</h1>
      <div class="caption">CPCB RULES 2022 • ZERO LANDFILL CAMPUS CIRCULAR PROTOCOL</div>
      <div class="card">
        <p><strong>Meta Webhook Endpoint:</strong> <code>POST /webhook</code></p>
        <p><strong>Webhook Verification:</strong> <code>GET /webhook</code> (Verify Token: <code>${metaConfig.verifyToken}</code>)</p>
        <p><strong>Health Check:</strong> <a href="/api/health">/api/health</a></p>
        <p><strong>CPCB Recyclers:</strong> <a href="/api/recyclers">/api/recyclers</a></p>
        <p><strong>Live Real Data Stats:</strong> <a href="/api/stats">/api/stats</a></p>
        <hr style="border: 0; border-top: 1px solid #27272A; margin: 20px 0;" />
        <div style="font-size: 0.85rem; color: #888891;">
          Connect your WhatsApp Cloud API webhook in the Meta App Dashboard to begin processing live campus recycling transactions.
        </div>
      </div>
    </body>
    </html>
  `);
});

// Server Initialization
async function startServer() {
  await connectDB();
  await seedDatabase();

  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 [EcoLoop WhatsApp Bot] Live and listening on port ${PORT}`);
    console.log(`📡 Base URL: ${metaConfig.baseUrl}`);
    console.log(`🔗 Webhook URL: ${metaConfig.baseUrl}/webhook`);
    console.log(`🔑 Webhook Verify Token: ${metaConfig.verifyToken}`);
    console.log(`🛡️ CPCB Portal: ${metaConfig.cpcbPortalUrl}`);
    console.log(`======================================================\n`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server boot error:', err);
});
