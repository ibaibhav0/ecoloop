import express from 'express';
import { generateApiKey, listApiKeys } from '../controllers/statsController.js';

const router = express.Router();

router.post('/generate', generateApiKey);
router.get('/', listApiKeys);

export default router;
