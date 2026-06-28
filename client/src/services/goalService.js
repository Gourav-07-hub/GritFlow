/**
 * goalService.js — Goal Setting API client services
 */

import api from './axiosConfig';

/**
 * Fetch all active goals for the logged-in user
 * @returns {Promise<array>} Array of goals
 */
export const getGoals = async () => {
  try {
    const response = await api.get('/goals');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch goals';
    throw message;
  }
};

/**
 * Create a new goal
 * @param {object} goalData 
 * @returns {Promise<object>} Created goal
 */
export const createGoal = async (goalData) => {
  try {
    const response = await api.post('/goals', goalData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to create goal';
    throw message;
  }
};

/**
 * Update an existing goal by ID
 * @param {string} id 
 * @param {object} goalData 
 * @returns {Promise<object>} Updated goal
 */
export const updateGoal = async (id, goalData) => {
  try {
    const response = await api.put(`/goals/${id}`, goalData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to update goal';
    throw message;
  }
};

/**
 * Soft delete a goal by ID
 * @param {string} id 
 * @returns {Promise<object>} Confirmation message
 */
export const deleteGoal = async (id) => {
  try {
    const response = await api.delete(`/goals/${id}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to delete goal';
    throw message;
  }
};

/**
 * Update a goal's manual progress percentage (0-100)
 * @param {string} id 
 * @param {number} progress 
 * @returns {Promise<object>} Updated goal
 */
export const updateGoalProgress = async (id, progress) => {
  try {
    const response = await api.patch(`/goals/${id}/progress`, { progress });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to update progress';
    throw message;
  }
};

/**
 * Toggle a goal milestone's completion state
 * @param {string} id 
 * @param {string} milestoneId 
 * @returns {Promise<object>} Updated goal with recalculated progress percentage
 */
export const toggleMilestone = async (id, milestoneId) => {
  try {
    const response = await api.patch(`/goals/${id}/milestones/${milestoneId}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to toggle milestone';
    throw message;
  }
};
