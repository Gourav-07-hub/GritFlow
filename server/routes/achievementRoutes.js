import express from 'express';
import {
  getAchievements,
  checkAchievements,
  getAchievementStats,
} from '../controllers/achievementController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to all routes in this router
router.use(protect);

router.route('/')
  .get(getAchievements);

router.post('/check', checkAchievements);

router.get('/stats', getAchievementStats);

export default router;
