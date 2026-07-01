import express from 'express';
import { createLinkToken, createUpdateLinkToken, exchangePublicToken, manualSync, webhookHandler } from '../controllers/plaidController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/create-link-token', protect, createLinkToken);
router.post('/create-update-token', protect, createUpdateLinkToken);
router.post('/exchange-token', protect, exchangePublicToken);
router.post('/sync', protect, manualSync);

// Webhooks don't use 'protect' because they are called by Plaid's servers, not our frontend
router.post('/webhooks', webhookHandler);

export default router;
