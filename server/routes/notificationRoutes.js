import express from 'express';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  getSocialNotifications,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply auth middleware to all routes in this router
router.use(protect);

router.route('/')
  .get(getNotifications);

router.get('/social', getSocialNotifications);

router.get('/unread-count', getUnreadCount);

router.patch('/read-all', markAllAsRead);

router.patch('/:id/read', markAsRead);

router.delete('/clear-all', clearAllNotifications);

router.delete('/:id', deleteNotification);

export default router;
