/**
 * routes/focusRoutes.js — Express routing for the Focus Timer endpoints
 */

import express from 'express';
import {
  getSessions,
  createSession,
  deleteSession,
  getFocusStats,
  getSettings,
  updateSettings,
} from '../controllers/focusController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authorization guard to all endpoints on this router
router.use(protect);

// GET /api/focus/sessions & POST /api/focus/sessions
router.route('/sessions')
  .get(getSessions)
  .post(createSession);

// DELETE /api/focus/sessions/:id
router.route('/sessions/:id')
  .delete(deleteSession);

// GET /api/focus/stats
router.route('/stats')
  .get(getFocusStats);

// GET /api/focus/settings & PUT /api/focus/settings
router.route('/settings')
  .get(getSettings)
  .put(updateSettings);

export default router;
