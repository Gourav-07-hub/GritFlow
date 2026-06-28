/**
 * routes/goalRoutes.js — Express routing for the Goal Setting endpoints
 */

import express from 'express';
import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  updateGoalProgress,
  toggleMilestone,
} from '../controllers/goalController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateGoal, validateGoalUpdate } from '../middleware/validateMiddleware.js';

const router = express.Router();

// Apply authorization guard to all endpoints on this router
router.use(protect);

// GET /api/goals & POST /api/goals
router.route('/')
  .get(getGoals)
  .post(validateGoal, createGoal);

// PUT & DELETE goal by ID
router.route('/:id')
  .put(validateGoalUpdate, updateGoal)
  .delete(deleteGoal);

// PATCH manual progress update (0-100)
router.patch('/:id/progress', updateGoalProgress);

// PATCH toggle milestone complete/incomplete
router.patch('/:id/milestones/:milestoneId', toggleMilestone);

export default router;
