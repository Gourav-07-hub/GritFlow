import api from './axiosConfig';

/**
 * Fetch all achievements for the logged-in user
 * @returns {Promise<Array>} List of user achievements
 */
export const getAchievements = async () => {
  try {
    const response = await api.get('/achievements');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch achievements';
    throw message;
  }
};

/**
 * Trigger check for any new achievements
 * @returns {Promise<Array>} List of newly unlocked achievements
 */
export const checkAchievements = async () => {
  try {
    const response = await api.post('/achievements/check');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to check achievements';
    throw message;
  }
};

/**
 * Fetch achievement statistics
 * @returns {Promise<object>} Stats summary and category breakdown
 */
export const getAchievementStats = async () => {
  try {
    const response = await api.get('/achievements/stats');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch achievement stats';
    throw message;
  }
};
