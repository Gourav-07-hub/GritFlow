import api from './api.js';

/**
 * Get or create a private conversation with a recipient
 * @param {string} recipientId
 */
export const getOrCreateConversation = async (recipientId) => {
  const response = await api.post('/chat/conversations', { recipientId });
  return response.data;
};

/**
 * Get all conversations for the logged in user
 */
export const getConversations = async () => {
  try {
    const response = await api.get('/chat/conversations');
    return response.data;
  } catch (error) {
    console.error('getConversations service error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get messages for a specific conversation with pagination
 * @param {string} conversationId
 * @param {number} page
 * @param {number} limit
 */
export const getMessages = async (conversationId, page = 1, limit = 50) => {
  const response = await api.get(`/chat/conversations/${conversationId}/messages`, {
    params: { page, limit }
  });
  return response.data;
};

/**
 * Send a message
 * @param {string} conversationId
 * @param {string} content
 * @param {string} type
 */
export const sendMessage = async (conversationId, content, type = 'text') => {
  const response = await api.post('/chat/messages', { conversationId, content, type });
  return response.data;
};

/**
 * Add or remove emoji reaction
 * @param {string} messageId
 * @param {string} emoji
 */
export const addReaction = async (messageId, emoji) => {
  const response = await api.patch(`/chat/messages/${messageId}/react`, { emoji });
  return response.data;
};

/**
 * Soft delete a message
 * @param {string} messageId
 */
export const deleteMessage = async (messageId) => {
  const response = await api.delete(`/chat/messages/${messageId}`);
  return response.data;
};

/**
 * Get total unread message count
 */
export const getUnreadMessageCount = async () => {
  const response = await api.get('/chat/unread-count');
  return response.data;
};
