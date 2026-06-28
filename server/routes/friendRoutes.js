import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getFriends,
  searchUsers,
  getPendingRequests,
  getSentRequests,
  sendFriendRequest,
  respondToRequest,
  removeFriend,
  getFriendProfile,
  getStreakComparison
} from '../controllers/friendController.js';

const router = express.Router();

// Apply protect middleware to all routes in this router
router.use(protect);

router.get('/', getFriends);
router.get('/search', searchUsers);
router.get('/pending', getPendingRequests);
router.get('/sent', getSentRequests);
router.post('/request', sendFriendRequest);
router.patch('/respond', respondToRequest);
router.get('/:userId/profile', getFriendProfile);
router.get('/:userId/compare', getStreakComparison);
router.delete('/:friendshipId', removeFriend);

export default router;
