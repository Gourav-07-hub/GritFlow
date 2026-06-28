import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Friendship from '../models/Friendship.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

// Maintain a Map of online users: userId → socketId
const onlineUsers = new Map();

export let io;

export const isUserInRoom = async (userId, roomId) => {
  if (!io) return false;
  const userSockets = await io.in(userId.toString()).allSockets();
  const roomSockets = await io.in(roomId.toString()).allSockets();
  for (const socketId of userSockets) {
    if (roomSockets.has(socketId)) {
      return true;
    }
  }
  return false;
};

export const socketHandler = (ioInstance) => {
  io = ioInstance;
  // Authentication Middleware for Socket.io
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = user;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.user._id.toString();

    // Attach decoded user ID to the socket
    socket.userId = userId;

    // Join user to their personal room: socket.join(userId)
    socket.join(userId);

    // Add user to online map
    onlineUsers.set(userId, socket.id);
    console.log(`User connected: ${userId}`);

    // Helper: Find all friends of the user to notify online/offline
    const getFriends = async (uid) => {
      const friendships = await Friendship.find({
        $or: [
          { requester: uid },
          { recipient: uid }
        ],
        status: 'accepted'
      });
      return friendships.map((f) =>
        f.requester.toString() === uid ? f.recipient.toString() : f.requester.toString()
      );
    };

    // Emit 'friend_online' to all friends' personal rooms
    try {
      const friends = await getFriends(userId);
      friends.forEach((friendId) => {
        io.to(friendId).emit('friend_online', { userId });
      });
    } catch (err) {
      console.error(`Error notifying friends of online status for user ${userId}:`, err.message);
    }

    // Event: join_conversation
    // Client sends: { conversationId }
    socket.on('join_conversation', async ({ conversationId }) => {
      try {
        if (!conversationId) return;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          socket.emit('error_message', { message: 'Conversation not found' });
          return;
        }

        const isParticipant = conversation.participants.some(
          (p) => p.toString() === userId
        );
        if (!isParticipant) {
          socket.emit('error_message', { message: 'You are not a participant of this conversation' });
          return;
        }

        socket.join(conversationId);
      } catch (err) {
        socket.emit('error_message', { message: err.message });
      }
    });

    // Event: leave_conversation
    // Client sends: { conversationId }
    socket.on('leave_conversation', ({ conversationId }) => {
      if (conversationId) {
        socket.leave(conversationId);
      }
    });

    // Event: send_message
    // Client sends: { conversationId, content, type }
    socket.on('send_message', async ({ conversationId, content, type }) => {
      try {
        if (!content || content.trim() === '') {
          socket.emit('error_message', { message: 'Content cannot be empty' });
          return;
        }

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          socket.emit('error_message', { message: 'Conversation not found' });
          return;
        }

        const isParticipant = conversation.participants.some(
          (p) => p.toString() === userId
        );
        if (!isParticipant) {
          socket.emit('error_message', { message: 'You are not a participant of this conversation' });
          return;
        }

        // Create message in DB
        const message = await Message.create({
          conversation: conversationId,
          sender: userId,
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

        // Emit 'new_message' to entire conversation room
        io.to(conversationId).emit('new_message', { message: populatedMessage });

        // Emit 'conversation_updated' to both participants' personal rooms
        conversation.participants.forEach((pId) => {
          io.to(pId.toString()).emit('conversation_updated', {
            conversationId,
            lastMessage: {
              _id: message._id,
              content: message.content,
              sender: message.sender,
              createdAt: message.createdAt,
              isRead: message.isRead
            },
            lastActivity: conversation.lastActivity
          });
        });

        // Real-time new message notification to recipient if not currently in conversation room
        const recipientId = conversation.participants
          .find((p) => p.toString() !== userId)
          ?.toString();

        if (recipientId) {
          const recipientInRoom = await isUserInRoom(recipientId, conversationId);
          if (!recipientInRoom) {
            const sender = socket.user;
            io.to(recipientId).emit('new_message_notification', {
              type: 'new_message',
              message: `New message from ${sender.name}`,
              from: {
                _id: sender._id,
                name: sender.name,
                username: sender.username,
                avatar: sender.avatar
              },
              conversationId,
              preview: content.substring(0, 50)
            });
          }
        }
      } catch (err) {
        socket.emit('error_message', { message: err.message });
      }
    });

    // Event: typing_start
    // Client sends: { conversationId }
    socket.on('typing_start', ({ conversationId }) => {
      if (conversationId) {
        socket.to(conversationId).emit('user_typing', {
          userId,
          conversationId,
          isTyping: true
        });
      }
    });

    // Event: typing_stop
    // Client sends: { conversationId }
    socket.on('typing_stop', ({ conversationId }) => {
      if (conversationId) {
        socket.to(conversationId).emit('user_typing', {
          userId,
          conversationId,
          isTyping: false
        });
      }
    });

    // Event: mark_read
    // Client sends: { conversationId }
    socket.on('mark_read', async ({ conversationId }) => {
      try {
        if (!conversationId) return;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;

        const isParticipant = conversation.participants.some(
          (p) => p.toString() === userId
        );
        if (!isParticipant) return;

        // Mark all messages in conversation as read for this user
        await Message.updateMany(
          {
            conversation: conversationId,
            sender: { $ne: userId },
            isRead: false,
            isDeleted: false
          },
          {
            $set: { isRead: true, readAt: new Date() }
          }
        );

        // Emit 'messages_read' to conversation room
        io.to(conversationId).emit('messages_read', {
          conversationId,
          userId
        });
      } catch (err) {
        console.error('Error in mark_read socket event:', err.message);
      }
    });

    // Event: add_reaction
    // Client sends: { messageId, emoji }
    socket.on('add_reaction', async ({ messageId, emoji }) => {
      try {
        if (!messageId || !emoji) return;

        const message = await Message.findById(messageId);
        if (!message) return;

        const conversation = await Conversation.findById(message.conversation);
        if (!conversation) return;

        const isParticipant = conversation.participants.some(
          (p) => p.toString() === userId
        );
        if (!isParticipant) return;

        // Toggle reaction in DB
        const existingReactionIndex = message.reactions.findIndex(
          (r) => r.emoji === emoji && r.user.toString() === userId
        );

        if (existingReactionIndex > -1) {
          message.reactions.splice(existingReactionIndex, 1);
        } else {
          message.reactions.push({
            emoji,
            user: userId
          });
        }

        await message.save();

        // Emit 'reaction_updated' to conversation room
        io.to(message.conversation.toString()).emit('reaction_updated', {
          messageId,
          reactions: message.reactions
        });
      } catch (err) {
        console.error('Error in add_reaction socket event:', err.message);
      }
    });

    // Event: disconnect
    socket.on('disconnect', async (reason) => {
      onlineUsers.delete(userId);
      console.log('User disconnected:', socket.user?._id, 'Reason:', reason);

      try {
        const friends = await getFriends(userId);
        friends.forEach((friendId) => {
          io.to(friendId).emit('friend_offline', { userId });
        });
      } catch (err) {
        console.error(`Error notifying friends of offline status for user ${userId}:`, err.message);
      }
    });
  });
};
