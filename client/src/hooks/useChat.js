import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import socket from '../socket/socketClient.js';
import {
  getOrCreateConversation as getOrCreateConvApi,
  getConversations as getConversationsApi,
  getMessages as getMessagesApi,
  deleteMessage as deleteMessageApi,
  getUnreadMessageCount as getUnreadCountApi
} from '../services/chatService.js';

/**
 * Custom hook managing the chat state, pagination, and real-time events.
 */
export default function useChat() {
  const { user } = useAuth();
  const currentUserId = user?._id || user?.id;

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState({ conversations: false, messages: false });
  const [error, setError] = useState(null);

  const typingTimeoutRef = useRef(null);
  const friendTypingTimeoutRef = useRef(null);
  const activeConversationRef = useRef(activeConversation);

  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);

  const fetchConversations = useCallback(async () => {
    setLoading((prev) => ({ ...prev, conversations: true }));
    setError(null);
    try {
      const data = await getConversationsApi();
      setConversations(data);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err.message || 'Failed to fetch conversations');
    } finally {
      setLoading((prev) => ({ ...prev, conversations: false }));
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await getUnreadCountApi();
      setUnreadCount(data.count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
      setError(err.message || 'Failed to fetch unread count');
    }
  }, []);

  useEffect(() => {
    if (currentUserId) {
      fetchConversations();
      fetchUnreadCount();
    }
  }, [currentUserId, fetchConversations, fetchUnreadCount]);

  useEffect(() => {
    if (!currentUserId) return;

    const handleNewMessage = ({ message }) => {
      try {
        const activeConv = activeConversationRef.current;

        if (activeConv && message.conversation === activeConv._id) {
          setMessages((prev) => {
            if (prev.some((m) => m._id === message._id)) return prev;
            return [message, ...prev];
          });
          socket.emit('mark_read', { conversationId: activeConv._id });
        } else {
          if (message.sender._id !== currentUserId) {
            setUnreadCount((prev) => prev + 1);
          }
        }

        setConversations((prev) => {
          const index = prev.findIndex((c) => c._id === message.conversation);
          if (index > -1) {
            const updatedConv = {
              ...prev[index],
              lastMessage: message,
              lastActivity: message.createdAt,
              unreadCount: (activeConv && message.conversation === activeConv._id) || message.sender._id === currentUserId
                ? prev[index].unreadCount
                : (prev[index].unreadCount || 0) + 1
            };
            const nextConvs = [...prev];
            nextConvs.splice(index, 1);
            return [updatedConv, ...nextConvs];
          } else {
            fetchConversations();
            return prev;
          }
        });
      } catch (err) {
        console.error('Error handling new message socket event:', err);
        setError(err.message || 'Error handling new message');
      }
    };

    const handleUserTyping = ({ userId, conversationId, isTyping: typingStatus }) => {
      try {
        const activeConv = activeConversationRef.current;
        if (activeConv && conversationId === activeConv._id && userId !== currentUserId) {
          setIsTyping(typingStatus);

          if (friendTypingTimeoutRef.current) {
            clearTimeout(friendTypingTimeoutRef.current);
            friendTypingTimeoutRef.current = null;
          }

          if (typingStatus) {
            friendTypingTimeoutRef.current = setTimeout(() => {
              setIsTyping(false);
            }, 3000);
          }
        }
      } catch (err) {
        console.error('Error handling user typing socket event:', err);
      }
    };

    const handleMessagesRead = ({ conversationId, userId }) => {
      try {
        const activeConv = activeConversationRef.current;
        if (activeConv && conversationId === activeConv._id) {
          setMessages((prev) =>
            prev.map((m) => {
              if (m.sender._id === userId) {
                return { ...m, isRead: true, readAt: new Date() };
              }
              return m;
            })
          );
        }

        setConversations((prev) =>
          prev.map((c) => {
            if (c._id === conversationId) {
              return { ...c, unreadCount: userId === currentUserId ? 0 : c.unreadCount };
            }
            return c;
          })
        );

        if (userId === currentUserId) {
          fetchUnreadCount();
        }
      } catch (err) {
        console.error('Error handling messages read socket event:', err);
      }
    };

    const handleReactionUpdated = ({ messageId, reactions }) => {
      try {
        setMessages((prev) =>
          prev.map((m) => {
            if (m._id === messageId) {
              return { ...m, reactions };
            }
            return m;
          })
        );
      } catch (err) {
        console.error('Error handling reaction updated socket event:', err);
      }
    };

    const handleConversationUpdated = ({ conversationId, lastMessage, lastActivity }) => {
      try {
        setConversations((prev) => {
          const index = prev.findIndex((c) => c._id === conversationId);
          if (index > -1) {
            const updatedConv = {
              ...prev[index],
              lastMessage,
              lastActivity
            };
            const nextConvs = [...prev];
            nextConvs.splice(index, 1);
            return [updatedConv, ...nextConvs];
          }
          return prev;
        });
      } catch (err) {
        console.error('Error handling conversation updated socket event:', err);
      }
    };

    const handleNewMessageNotificationSocket = ({ conversationId, lastMessage, lastActivity }) => {
      try {
        setUnreadCount((prev) => prev + 1);
        setConversations((prev) => {
          const index = prev.findIndex((c) => c._id === conversationId);
          if (index > -1) {
            const updatedConv = {
              ...prev[index],
              lastMessage,
              lastActivity,
              unreadCount: (prev[index].unreadCount || 0) + 1
            };
            const nextConvs = [...prev];
            nextConvs.splice(index, 1);
            return [updatedConv, ...nextConvs];
          } else {
            fetchConversations();
            return prev;
          }
        });
      } catch (err) {
        console.error('Error handling new message notification socket event:', err);
      }
    };

    socket.off('new_message');
    socket.off('user_typing');
    socket.off('messages_read');
    socket.off('reaction_updated');
    socket.off('conversation_updated');
    socket.off('new_message_notification');

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleUserTyping);
    socket.on('messages_read', handleMessagesRead);
    socket.on('reaction_updated', handleReactionUpdated);
    socket.on('conversation_updated', handleConversationUpdated);
    socket.on('new_message_notification', handleNewMessageNotificationSocket);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('messages_read', handleMessagesRead);
      socket.off('reaction_updated', handleReactionUpdated);
      socket.off('conversation_updated', handleConversationUpdated);
      socket.off('new_message_notification', handleNewMessageNotificationSocket);
      if (friendTypingTimeoutRef.current) {
        clearTimeout(friendTypingTimeoutRef.current);
      }
    };
  }, [currentUserId, fetchConversations, fetchUnreadCount]);

  const openConversation = useCallback(async (recipientId) => {
    setLoading((prev) => ({ ...prev, messages: true }));
    setError(null);
    try {
      const conv = await getOrCreateConvApi(recipientId);
      setActiveConversation(conv);

      socket.emit('join_conversation', { conversationId: conv._id });

      const data = await getMessagesApi(conv._id, 1, 50);
      setMessages(data.messages.reverse());
      setHasMore(data.hasMore);
      setCurrentPage(1);

      socket.emit('mark_read', { conversationId: conv._id });

      setConversations((prev) =>
        prev.map((c) => {
          if (c._id === conv._id) {
            return { ...c, unreadCount: 0 };
          }
          return c;
        })
      );

      fetchUnreadCount();
    } catch (err) {
      console.error('Error opening conversation:', err);
      setError(err.message || 'Failed to open conversation');
    } finally {
      setLoading((prev) => ({ ...prev, messages: false }));
    }
  }, [fetchUnreadCount]);

  const closeConversation = useCallback(() => {
    try {
      const activeConv = activeConversationRef.current;
      if (activeConv) {
        socket.emit('leave_conversation', { conversationId: activeConv._id });
        setActiveConversation(null);
        setMessages([]);
        setIsTyping(false);
      }
    } catch (err) {
      console.error('Error closing conversation:', err);
      setError(err.message || 'Failed to close conversation');
    }
  }, []);

  const stopTyping = useCallback(() => {
    try {
      const activeConv = activeConversationRef.current;
      if (activeConv) {
        socket.emit('typing_stop', { conversationId: activeConv._id });
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }
      }
    } catch (err) {
      console.error('Error stopping typing:', err);
    }
  }, []);

  const sendMessage = useCallback((content) => {
    try {
      const activeConv = activeConversationRef.current;
      if (activeConv && content.trim() !== '') {
        socket.emit('send_message', {
          conversationId: activeConv._id,
          content,
          type: 'text'
        });
        stopTyping();
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message || 'Failed to send message');
    }
  }, [stopTyping]);

  const loadMoreMessages = useCallback(async () => {
    const activeConv = activeConversationRef.current;
    if (activeConv && hasMore && !loading.messages) {
      const nextPage = currentPage + 1;
      try {
        const data = await getMessagesApi(activeConv._id, nextPage, 50);
        setMessages((prev) => [...prev, ...data.messages.reverse()]);
        setHasMore(data.hasMore);
        setCurrentPage(nextPage);
      } catch (err) {
        console.error('Error loading more messages:', err);
        setError(err.message || 'Failed to load more messages');
      }
    }
  }, [currentPage, hasMore, loading.messages]);

  const startTyping = useCallback(() => {
    try {
      const activeConv = activeConversationRef.current;
      if (activeConv) {
        socket.emit('typing_start', { conversationId: activeConv._id });

        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
          stopTyping();
        }, 3000);
      }
    } catch (err) {
      console.error('Error starting typing:', err);
    }
  }, [stopTyping]);

  const reactToMessage = useCallback((messageId, emoji) => {
    try {
      socket.emit('add_reaction', { messageId, emoji });
    } catch (err) {
      console.error('Error reacting to message:', err);
    }
  }, []);

  const removeMessage = useCallback(async (messageId) => {
    try {
      const updatedMessage = await deleteMessageApi(messageId);
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? updatedMessage : m))
      );
    } catch (err) {
      console.error('Error deleting message:', err);
      setError(err.message || 'Failed to delete message');
    }
  }, []);

  return {
    conversations,
    activeConversation,
    messages,
    isTyping,
    unreadCount,
    hasMore,
    currentPage,
    loading,
    error,
    fetchConversations,
    openConversation,
    closeConversation,
    sendMessage,
    loadMoreMessages,
    startTyping,
    stopTyping,
    reactToMessage,
    removeMessage,
    fetchUnreadCount
  };
}
