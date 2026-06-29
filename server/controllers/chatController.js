import User from '../models/User.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Friendship from '../models/Friendship.js';
import { io } from '../socket/socketInstance.js';

/**
 * POST /api/chat/conversations
 * Get or create a private conversation with a friend
 */
export const getOrCreateConversation = async (req, res) => {
  try {
    console.log('=== getOrCreateConversation START ===');
    console.log('Body:', req.body);
    console.log('User:', req.user?._id);

    const { recipientId } = req.body;

    // Guard 1 — check recipientId exists
    if (!recipientId) {
      console.log('ERROR: recipientId missing');
      return res.status(400).json({ message: 'recipientId is required' });
    }

    // Guard 2 — check recipient user exists
    console.log('Finding recipient user...');
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      console.log('ERROR: recipient not found');
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('Recipient found:', recipient.name);

    // Guard 3 — check friendship exists
    console.log('Checking friendship...');
    const friendship = await Friendship.findOne({
      $or: [
        { requester: req.user._id, recipient: recipientId, status: 'accepted' },
        { requester: recipientId, recipient: req.user._id, status: 'accepted' }
      ]
    });
    console.log('Friendship found:', friendship ? 'yes' : 'no');

    if (!friendship) {
      return res.status(403).json({
        message: 'You can only chat with friends'
      });
    }

    // Guard 4 — find existing conversation
    console.log('Finding existing conversation...');
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, recipientId] }
    }).populate('participants', '_id name username avatar')
      .populate('lastMessage');

    if (conversation) {
      console.log('Existing conversation found:', conversation._id);
      return res.status(200).json(conversation);
    }

    // Guard 5 — create new conversation
    console.log('Creating new conversation...');
    conversation = await Conversation.create({
      participants: [req.user._id, recipientId],
      lastActivity: new Date()
    });
    console.log('New conversation created:', conversation._id);

    // Populate after creation
    conversation = await Conversation.findById(conversation._id)
      .populate('participants', '_id name username avatar');

    console.log('=== getOrCreateConversation SUCCESS ===');
    return res.status(200).json(conversation);

  } catch (error) {
    console.error('=== getOrCreateConversation ERROR ===');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    return res.status(500).json({
      message: 'Failed to create conversation',
      error: error.message
    });
  }
};

/**
 * GET /api/chat/conversations
 * Get all active conversations for the logged in user
 */
export const getConversations = async (req, res) => {
  try {
    console.log('getConversations called for user:', req.user?._id);
    
    // Find all conversations where participants includes req.user._id and isActive === true
    const conversations = await Conversation.find({
      participants: req.user._id,
      isActive: true
    })
      .populate('participants', '_id name username avatar')
      .populate({
        path: 'lastMessage',
        select: 'content sender createdAt isRead'
      })
      .sort({ lastActivity: -1 });

    // Include unreadCount for each conversation
    const conversationsWithCount = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversation: conv._id,
          sender: { $ne: req.user._id },
          isRead: false,
          isDeleted: false
        });
        return {
          ...conv.toObject(),
          unreadCount
        };
      })
    );

    return res.status(200).json(conversationsWithCount);
  } catch (error) {
    console.error('getConversations ERROR:', error.message);
    console.error('Stack:', error.stack);
    return res.status(500).json({
      message: 'Failed to load conversations',
      error: error.message
    });
  }
};

/**
 * GET /api/chat/conversations/:conversationId/messages
 * Get messages for a conversation with pagination
 */
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Verify conversation exists
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Verify logged in user is a participant of this conversation
    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ message: 'You are not a participant of this conversation' });
    }

    // Optional page and limit for pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const query = { conversation: conversationId, isDeleted: false };
    const totalMessages = await Message.countDocuments(query);
    const totalPages = Math.ceil(totalMessages / limit);

    const messages = await Message.find(query)
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', '_id name username avatar');

    // Mark all unread messages as read where sender is NOT logged in user
    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: req.user._id },
        isRead: false,
        isDeleted: false
      },
      {
        $set: { isRead: true, readAt: new Date() }
      }
    );

    return res.status(200).json({
      messages,
      totalPages,
      currentPage: page,
      hasMore: page < totalPages
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * POST /api/chat/messages
 * Send a new message in a conversation
 */
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, content, type } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Message content cannot be empty' });
    }

    if (content.length > 1000) {
      return res.status(400).json({ message: 'Message content must be under 1000 characters' });
    }

    // Verify conversation exists
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Verify logged in user is a participant
    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ message: 'You are not a participant of this conversation' });
    }

    // Create new Message
    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      content,
      type: type || 'text'
    });

    // Update conversation lastMessage and lastActivity
    conversation.lastMessage = message._id;
    conversation.lastActivity = new Date();
    if (!conversation.isActive) {
      conversation.isActive = true;
    }
    await conversation.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', '_id name username avatar');

    return res.status(201).json(populatedMessage);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * PATCH /api/chat/messages/:messageId/react
 * Add or remove emoji reaction
 */
export const addReaction = async (req, res) => {
  try {
    const messageId = req.params.messageId || req.body.messageId;
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({ message: 'Emoji is required' });
    }

    // Find message by id
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Verify logged in user is a participant of the conversation
    const conversation = await Conversation.findById(message.conversation);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ message: 'You are not a participant of this conversation' });
    }

    // Check if logged in user already reacted with same emoji
    const existingReactionIndex = message.reactions.findIndex(
      (r) => r.emoji === emoji && r.user.toString() === req.user._id.toString()
    );

    if (existingReactionIndex > -1) {
      // Toggle off: remove that reaction
      message.reactions.splice(existingReactionIndex, 1);
    } else {
      // Toggle on: add new reaction
      message.reactions.push({
        emoji,
        user: req.user._id
      });
    }

    await message.save();

    const updatedMessage = await Message.findById(message._id)
      .populate('sender', '_id name username avatar');

    return res.status(200).json(updatedMessage);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * DELETE /api/chat/messages/:messageId
 * Soft delete a message
 */
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    // Find message by id
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Verify logged in user is a participant of the conversation
    const conversation = await Conversation.findById(message.conversation);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );
    if (!isParticipant) {
      return res.status(403).json({ message: 'You are not a participant of this conversation' });
    }

    // Verify sender matches req.user._id
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Cannot delete others messages' });
    }

    // Soft delete
    message.isDeleted = true;
    message.deletedAt = new Date();
    message.content = 'This message was deleted';
    await message.save();

    const updatedMessage = await Message.findById(message._id)
      .populate('sender', '_id name username avatar');

    return res.status(200).json(updatedMessage);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/chat/unread-count
 * Get total unread messages count across all active conversations
 */
export const getUnreadMessageCount = async (req, res) => {
  try {
    // Find all active conversations for the logged in user
    const userConversations = await Conversation.find({
      participants: req.user._id,
      isActive: true
    }).select('_id');

    const conversationIds = userConversations.map((c) => c._id);

    // Count unread messages
    const count = await Message.countDocuments({
      conversation: { $in: conversationIds },
      sender: { $ne: req.user._id },
      isRead: false,
      isDeleted: false
    });

    return res.status(200).json({ count });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
