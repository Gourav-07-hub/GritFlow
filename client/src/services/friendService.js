/**
 * friendService.js — Friends feature API client services
 */

import api from './axiosConfig';

/**
 * Search users by name or username
 * @param {string} query 
 * @returns {Promise<array>} Array of matched users
 */
export const searchUsers = async (query) => {
  try {
    const response = await api.get(`/friends/search?query=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message || 'Failed to search users';
  }
};

/**
 * Send a friend request to another user
 * @param {string} recipientId 
 * @returns {Promise<object>} Created friendship object
 */
export const sendFriendRequest = async (recipientId) => {
  try {
    const response = await api.post('/friends/request', { recipientId });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message || 'Failed to send friend request';
  }
};

/**
 * Respond to a pending friend request (accept/reject)
 * @param {string} friendshipId 
 * @param {string} action - 'accept' or 'reject'
 * @returns {Promise<object>} Updated friendship object
 */
export const respondToRequest = async (friendshipId, action) => {
  try {
    const response = await api.patch('/friends/respond', { friendshipId, action });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message || 'Failed to respond to friend request';
  }
};

/**
 * Fetch all accepted friends
 * @returns {Promise<array>} Array of friends
 */
export const getFriends = async () => {
  try {
    const response = await api.get('/friends');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message || 'Failed to fetch friends';
  }
};

/**
 * Fetch all pending friend requests (received)
 * @returns {Promise<array>} Array of pending requests
 */
export const getPendingRequests = async () => {
  try {
    const response = await api.get('/friends/pending');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message || 'Failed to fetch pending requests';
  }
};

/**
 * Fetch all sent friend requests
 * @returns {Promise<array>} Array of sent requests
 */
export const getSentRequests = async () => {
  try {
    const response = await api.get('/friends/sent');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message || 'Failed to fetch sent requests';
  }
};

/**
 * Remove an accepted friend
 * @param {string} friendshipId 
 * @returns {Promise<object>} Confirmation message
 */
export const removeFriend = async (friendshipId) => {
  try {
    const response = await api.delete(`/friends/${friendshipId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message || 'Failed to remove friend';
  }
};

/**
 * Fetch a friend's public profile data (streaks, achievements, etc.)
 * @param {string} userId
 * @returns {Promise<object>} Friend profile object
 */
export const getFriendProfile = async (userId) => {
  try {
    const response = await api.get(`/friends/${userId}/profile`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch side-by-side stats comparison with a friend
 * @param {string} userId
 * @returns {Promise<object>} Comparison stats object
 */
export const getStreakComparison = async (userId) => {
  try {
    const response = await api.get(`/friends/${userId}/compare`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
