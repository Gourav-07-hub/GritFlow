/**
 * routes/habitRoutes.js — Express routing for the Habit Tracker endpoints
 */

import express from 'express';
import {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  toggleHabitComplete,
} from '../controllers/habitController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateHabit, validateHabitUpdate } from '../middleware/validateMiddleware.js';

const router = express.Router();

// Apply authorization guard to all endpoints on this router
router.use(protect);

// GET /api/habits & POST /api/habits
router.route('/')
  .get(getHabits)
  .post(validateHabit, createHabit);

// PUT, DELETE, PATCH toggling by ID
router.route('/:id')
  .put(validateHabitUpdate, updateHabit)
  .delete(deleteHabit);

router.patch('/:id/toggle', toggleHabitComplete);

export default router;
