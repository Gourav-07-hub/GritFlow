/**
 * gratitudeService.js — Gratitude Journal API client services
 */

import api from './axiosConfig';

/**
 * Fetch all gratitude entries for the logged-in user with optional month and favorite filtering
 * @param {string} [month] - Format YYYY-MM
 * @param {boolean} [favorite] - If true, returns only entries with favorite items
 * @returns {Promise<array>} Array of gratitude entries
 */
export const getGratitudeEntries = async (month, favorite) => {
  try {
    const params = {};
    if (month) params.month = month;
    if (favorite) params.favorite = favorite;
    const response = await api.get('/gratitude', { params });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch gratitude entries';
    throw message;
  }
};

/**
 * Fetch a single gratitude entry by calendar date
 * @param {string} date - Format YYYY-MM-DD
 * @returns {Promise<object>} Gratitude entry
 */
export const getGratitudeByDate = async (date) => {
  try {
    const response = await api.get(`/gratitude/date/${date}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch gratitude entry';
    throw message;
  }
};

/**
 * Fetch gratitude journal statistics
 * @returns {Promise<object>} Gratitude statistics
 */
export const getGratitudeStats = async () => {
  try {
    const response = await api.get('/gratitude/stats');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch gratitude statistics';
    throw message;
  }
};

/**
 * Log a new gratitude entry
 * @param {object} data - { date, entries, mood, affirmation }
 * @returns {Promise<object>} Created gratitude entry
 */
export const createGratitudeEntry = async (data) => {
  try {
    const response = await api.post('/gratitude', data);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to log gratitude entry';
    throw message;
  }
};

/**
 * Update an existing gratitude entry
 * @param {string} id - Entry ID
 * @param {object} data - { entries, mood, affirmation }
 * @returns {Promise<object>} Updated gratitude entry
 */
export const updateGratitudeEntry = async (id, data) => {
  try {
    const response = await api.put(`/gratitude/${id}`, data);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to update gratitude entry';
    throw message;
  }
};

/**
 * Delete a gratitude entry (soft delete)
 * @param {string} id - Entry ID
 * @returns {Promise<object>} Success confirmation message
 */
export const deleteGratitudeEntry = async (id) => {
  try {
    const response = await api.delete(`/gratitude/${id}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to delete gratitude entry';
    throw message;
  }
};

/**
 * Toggle favorite state on a single item in a gratitude entry
 * @param {string} id - Entry ID
 * @param {string} itemId - Item ID inside the entries array
 * @returns {Promise<object>} Updated gratitude entry
 */
export const toggleFavoriteItem = async (id, itemId) => {
  try {
    const response = await api.patch(`/gratitude/${id}/items/${itemId}/favorite`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to toggle favorite item';
    throw message;
  }
};
