/**
 * statsService.js — Statistics Dashboard API client services
 */

import api from './axiosConfig';

/**
 * Fetch overview statistics across all modules
 * @returns {Promise<object>} Overview statistics
 */
export const getOverviewStats = async () => {
  try {
    const response = await api.get('/stats/overview');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch overview stats';
    throw message;
  }
};

/**
 * Fetch activity heatmap data for the last 365 days
 * @returns {Promise<array>} Array of daily activity scores
 */
export const getActivityHeatmap = async () => {
  try {
    const response = await api.get('/stats/heatmap');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch heatmap data';
    throw message;
  }
};

/**
 * Fetch weekly report summary (current Monday to Sunday)
 * @returns {Promise<object>} Weekly report data
 */
export const getWeeklyReport = async () => {
  try {
    const response = await api.get('/stats/weekly');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch weekly report';
    throw message;
  }
};

/**
 * Fetch monthly report summary
 * @param {string} month - Format YYYY-MM
 * @returns {Promise<object>} Monthly report data
 */
export const getMonthlyReport = async (month) => {
  try {
    const params = {};
    if (month) params.month = month;
    const response = await api.get('/stats/monthly', { params });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch monthly report';
    throw message;
  }
};

/**
 * Fetch streak leaderboard for the user
 * @returns {Promise<array>} Streaks list
 */
export const getStreakLeaderboard = async () => {
  try {
    const response = await api.get('/stats/streaks');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch streaks leaderboard';
    throw message;
  }
};
