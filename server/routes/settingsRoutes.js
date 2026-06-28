/**
 * routes/settingsRoutes.js — Express routing for the User Settings endpoints
 */

import express from 'express';
import {
  getProfile,
  updateProfile,
  changePassword,
  getPreferences,
  updatePreferences,
  deleteAccount,
  getAccountStats,
  uploadProfilePicture,
} from '../controllers/settingsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadAvatar } from '../middleware/uploadMiddleware.js';


const router = express.Router();

// Apply JWT authorization protect guard to all settings routes
router.use(protect);

// GET /api/settings/profile & PUT /api/settings/profile
router.route('/profile')
  .get(getProfile)
  .put(updateProfile);

// POST /api/settings/avatar
router.post('/avatar', uploadAvatar, uploadProfilePicture);


// PUT /api/settings/password
router.put('/password', changePassword);

// GET /api/settings/preferences & PUT /api/settings/preferences
router.route('/preferences')
  .get(getPreferences)
  .put(updatePreferences);

// DELETE /api/settings/account
router.delete('/account', deleteAccount);

// GET /api/settings/account-stats
router.get('/account-stats', getAccountStats);

export default router;
