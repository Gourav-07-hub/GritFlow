import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getOrCreateConversation,
  getConversations,
  getMessages,
  sendMessage,
  addReaction,
  deleteMessage,
  getUnreadMessageCount,
} from '../controllers/chatController.js';

const router = express.Router();

// Apply protect middleware to all routes in this router
router.use(protect);

router.route('/conversations')
  .post(getOrCreateConversation)
  .get(getConversations);

router.get('/conversations/:conversationId/messages', getMessages);

router.post('/messages', sendMessage);

router.patch('/messages/:messageId/react', addReaction);

router.delete('/messages/:messageId', deleteMessage);

router.get('/unread-count', getUnreadMessageCount);

export default router;
