/**
 * focusService.js — Focus Timer API client services
 */

import api from './axiosConfig';

/**
 * Fetch focus sessions for the logged-in user (optional date and type filtering)
 * @param {string} [date] - Date string (YYYY-MM-DD)
 * @param {string} [type] - Session type ('focus' | 'short_break' | 'long_break')
 * @returns {Promise<array>} Array of focus sessions
 */
export const getSessions = async (date, type) => {
  try {
    const params = {};
    if (date) params.date = date;
    if (type) params.type = type;
    const response = await api.get('/focus/sessions', { params });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch sessions';
    throw message;
  }
};

/**
 * Log a completed focus session
 * @param {object} sessionData - { type, duration, label, notes, isCompleted }
 * @returns {Promise<object>} Created focus session
 */
export const createSession = async (sessionData) => {
  try {
    const response = await api.post('/focus/sessions', sessionData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to log focus session';
    throw message;
  }
};

/**
 * Delete a focus session
 * @param {string} id - Session ID
 * @returns {Promise<object>} Confirmation message
 */
export const deleteSession = async (id) => {
  try {
    const response = await api.delete(`/focus/sessions/${id}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to delete focus session';
    throw message;
  }
};

/**
 * Get focus statistics for the logged-in user
 * @returns {Promise<object>} Stats object
 */
export const getFocusStats = async () => {
  try {
    const response = await api.get('/focus/stats');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch focus stats';
    throw message;
  }
};

/**
 * Get focus timer settings for the logged-in user
 * @returns {Promise<object>} Settings object
 */
export const getSettings = async () => {
  try {
    const response = await api.get('/focus/settings');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch settings';
    throw message;
  }
};

/**
 * Update/upsert focus timer settings
 * @param {object} settingsData - { focusDuration, shortBreakDuration, longBreakDuration, sessionsBeforeLongBreak, autoStartBreaks, autoStartFocus }
 * @returns {Promise<object>} Updated settings object
 */
export const updateSettings = async (settingsData) => {
  try {
    const response = await api.put('/focus/settings', settingsData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to update settings';
    throw message;
  }
};
