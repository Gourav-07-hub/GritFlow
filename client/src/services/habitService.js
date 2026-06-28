/**
 * habitService.js — Habit Tracker API client services
 */

import api from './axiosConfig';

/**
 * Fetch all active habits for the logged-in user
 * @returns {Promise<array>} Array of habits
 */
export const getHabits = async () => {
  try {
    const response = await api.get('/habits');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch habits';
    throw message;
  }
};

/**
 * Create a new habit
 * @param {object} habitData 
 * @returns {Promise<object>} Created habit
 */
export const createHabit = async (habitData) => {
  try {
    const response = await api.post('/habits', habitData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to create habit';
    throw message;
  }
};

/**
 * Update an existing habit
 * @param {string} id 
 * @param {object} habitData 
 * @returns {Promise<object>} Updated habit
 */
export const updateHabit = async (id, habitData) => {
  try {
    const response = await api.put(`/habits/${id}`, habitData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to update habit';
    throw message;
  }
};

/**
 * Delete a habit (soft delete on the backend)
 * @param {string} id 
 * @returns {Promise<object>} Confirmation message
 */
export const deleteHabit = async (id) => {
  try {
    const response = await api.delete(`/habits/${id}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to delete habit';
    throw message;
  }
};

/**
 * Toggle habit completion state for today
 * @param {string} id 
 * @returns {Promise<object>} Updated habit with recalculated streak
 */
export const toggleHabitComplete = async (id) => {
  try {
    const response = await api.patch(`/habits/${id}/toggle`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to toggle completion';
    throw message;
  }
};
