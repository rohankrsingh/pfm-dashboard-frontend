import express from 'express';
import { getDashboardSummary, getMonthlyStats, getCashFlowHistory, getAdvancedAnalytics } from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/summary', getDashboardSummary);
router.get('/history', getCashFlowHistory);
router.get('/stats/:month', getMonthlyStats);
router.get('/advanced', getAdvancedAnalytics);

export default router;
