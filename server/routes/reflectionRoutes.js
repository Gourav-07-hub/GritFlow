/**
 * routes/reflectionRoutes.js — Express routing for the Reflection Journal endpoints
 */

import express from 'express';
import {
  getReflections,
  getReflectionByDate,
  createReflection,
  updateReflection,
  deleteReflection,
  getReflectionStats,
} from '../controllers/reflectionController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateReflection } from '../middleware/validateMiddleware.js';

const router = express.Router();

// Apply authorization guard to all endpoints on this router
router.use(protect);

// GET /api/reflections/stats (Must be declared BEFORE parameterised /:id)
router.get('/stats', getReflectionStats);

// GET /api/reflections/date/:date (Must be declared BEFORE parameterised /:id)
router.get('/date/:date', getReflectionByDate);

// GET /api/reflections & POST /api/reflections
router.route('/')
  .get(getReflections)
  .post(validateReflection, createReflection);

// PUT & DELETE reflection by ID
router.route('/:id')
  .put(updateReflection)
  .delete(deleteReflection);

export default router;
