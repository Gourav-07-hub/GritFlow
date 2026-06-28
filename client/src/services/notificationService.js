import api from './axiosConfig';

/**
 * Fetch recent notifications
 * @returns {Promise<Array>} List of notifications
 */
export const getNotifications = async () => {
  try {
    const response = await api.get('/notifications');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch notifications';
    throw message;
  }
};

/**
 * Fetch unread notification count
 * @returns {Promise<object>} { count: X }
 */
export const getUnreadCount = async () => {
  try {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch unread count';
    throw message;
  }
};

/**
 * Mark a single notification as read
 * @param {string} id - Notification ID
 * @returns {Promise<object>} Updated notification
 */
export const markAsRead = async (id) => {
  try {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to mark notification as read';
    throw message;
  }
};

/**
 * Mark all notifications as read
 * @returns {Promise<object>} Confirmation message
 */
export const markAllAsRead = async () => {
  try {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to mark all as read';
    throw message;
  }
};

/**
 * Delete a single notification
 * @param {string} id - Notification ID
 * @returns {Promise<object>} Confirmation message
 */
export const deleteNotification = async (id) => {
  try {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to delete notification';
    throw message;
  }
};

/**
 * Delete all notifications
 * @returns {Promise<object>} Confirmation message
 */
export const clearAllNotifications = async () => {
  try {
    const response = await api.delete('/notifications/clear-all');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to clear all notifications';
    throw message;
  }
};
