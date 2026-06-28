/**
 * routes/statsRoutes.js — Express routing for the unified Statistics Dashboard endpoints
 */

import express from 'express';
import {
  getOverviewStats,
  getActivityHeatmap,
  getWeeklyReport,
  getMonthlyReport,
  getStreakLeaderboard,
} from '../controllers/statsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply JWT authorization protect guard to all statistics endpoints
router.use(protect);

// GET /api/stats/overview
router.get('/overview', getOverviewStats);

// GET /api/stats/heatmap
router.get('/heatmap', getActivityHeatmap);

// GET /api/stats/weekly
router.get('/weekly', getWeeklyReport);

// GET /api/stats/monthly
router.get('/monthly', getMonthlyReport);

// GET /api/stats/streaks
router.get('/streaks', getStreakLeaderboard);

export default router;
