/**
 * settingsService.js — User Settings API client services
 */

import api from './axiosConfig';

/**
 * Fetch logged-in user profile details
 * @returns {Promise<object>} User profile
 */
export const getProfile = async () => {
  try {
    const response = await api.get('/settings/profile');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch profile';
    throw message;
  }
};

/**
 * Update user display name, email, and avatar
 * @param {object} profileData - { name, email, avatar }
 * @returns {Promise<object>} Updated user profile
 */
export const updateProfile = async (profileData) => {
  try {
    const response = await api.put('/settings/profile', profileData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to update profile';
    throw message;
  }
};

/**
 * Change user password
 * @param {object} passwordData - { currentPassword, newPassword }
 * @returns {Promise<object>} Confirmation message
 */
export const changePassword = async (passwordData) => {
  try {
    const response = await api.put('/settings/password', passwordData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to change password';
    throw message;
  }
};

/**
 * Fetch user preferences
 * @returns {Promise<object>} User preferences config
 */
export const getPreferences = async () => {
  try {
    const response = await api.get('/settings/preferences');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch preferences';
    throw message;
  }
};

/**
 * Update user preferences config
 * @param {object} prefsData - Preferences payload
 * @returns {Promise<object>} Updated preferences config
 */
export const updatePreferences = async (prefsData) => {
  try {
    const response = await api.put('/settings/preferences', prefsData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to update preferences';
    throw message;
  }
};

/**
 * Permanently delete user account
 * @param {string} password - User password for verification
 * @returns {Promise<object>} Confirmation message
 */
export const deleteAccount = async (password) => {
  try {
    const response = await api.delete('/settings/account', { data: { password } });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to delete account';
    throw message;
  }
};

/**
 * Fetch total summary stats for account details
 * @returns {Promise<object>} Account statistics
 */
export const getAccountStats = async () => {
  try {
    const response = await api.get('/settings/account-stats');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch account statistics';
    throw message;
  }
};
