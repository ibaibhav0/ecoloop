import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import itemRoutes from './routes/itemRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import erpRoutes from './routes/erpRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import carbonRoutes from './routes/carbonRoutes.js';
import partnershipRoutes from './routes/partnershipRoutes.js';
import mapRoutes from './routes/mapRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import keyRoutes from './routes/keyRoutes.js';
import complianceRoutes from './routes/complianceRoutes.js';
import { complianceService } from './services/complianceService.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swaggerSpec.js';
import { seedDatabase } from './seed.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Swagger / OpenAPI Interactive Documentation
app.get('/api/docs/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});
app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'EcoLoop Public REST API Documentation',
  })
);
app.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'EcoLoop Public REST API Documentation',
  })
);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'EcoLoop API Backend',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/keys', keyRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/erp', erpRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/carbon', carbonRoutes);
app.use('/api/partnership', partnershipRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/compliance', complianceRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Ensure database and seeds are initialized on serverless invocation
let isInitialized = false;
export const ensureInitialized = async () => {
  if (!isInitialized) {
    await connectDB();
    await seedDatabase();
    try {
      const audit = await complianceService.runComplianceAudit({ notifyAdmin: false });
      console.log(`🛡️ Compliance Monitor Active: Health Score ${audit.healthScore}/100 | ${audit.totalCriticalBreaches} critical breaches detected.`);
    } catch (err) {
      console.warn('⚠️ Initial compliance audit note:', err.message);
    }
    isInitialized = true;
  }
};

app.use(async (req, res, next) => {
  try {
    await ensureInitialized();
  } catch (err) {
    console.warn('Initialization error:', err);
  }
  next();
});

// Start Server in standalone mode (local dev)
const startServer = async () => {
  await ensureInitialized();
  app.listen(PORT, () => {
    console.log(`🚀 EcoLoop Server is running on port ${PORT} (http://localhost:${PORT})`);
  });
};

if (!process.env.VERCEL) {
  startServer().catch(err => {
    console.error('Failed to start server:', err);
  });
}

export { app };
export default app;
