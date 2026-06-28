/**
 * routes/gratitudeRoutes.js — Express routing for the Gratitude Journal endpoints
 */

import express from 'express';
import {
  getGratitudeEntries,
  getGratitudeStats,
  getGratitudeByDate,
  createGratitudeEntry,
  updateGratitudeEntry,
  deleteGratitudeEntry,
  toggleFavoriteItem,
} from '../controllers/gratitudeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateGratitude } from '../middleware/validateMiddleware.js';

const router = express.Router();

// Apply auth protection to all gratitude routes
router.use(protect);

// GET /api/gratitude & POST /api/gratitude
router.route('/')
  .get(getGratitudeEntries)
  .post(validateGratitude, createGratitudeEntry);

// GET /api/gratitude/stats
router.get('/stats', getGratitudeStats);

// GET /api/gratitude/date/:date
router.get('/date/:date', getGratitudeByDate);

// PUT /api/gratitude/:id & DELETE /api/gratitude/:id
router.route('/:id')
  .put(updateGratitudeEntry)
  .delete(deleteGratitudeEntry);

// PATCH /api/gratitude/:id/items/:itemId/favorite
router.patch('/:id/items/:itemId/favorite', toggleFavoriteItem);

export default router;
