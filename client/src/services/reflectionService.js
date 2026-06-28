/**
 * reflectionService.js — Reflection Journal API client services
 */

import api from './axiosConfig';

/**
 * Get all active reflections, optionally filtered by month (YYYY-MM)
 * @param {string} [month] 
 * @returns {Promise<array>} Array of reflections
 */
export const getReflections = async (month) => {
  try {
    const url = month ? `/reflections?month=${month}` : '/reflections';
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch reflections';
    throw message;
  }
};

/**
 * Fetch a single reflection by date (YYYY-MM-DD)
 * @param {string} date 
 * @returns {Promise<object>} Reflection object
 */
export const getReflectionByDate = async (date) => {
  try {
    const response = await api.get(`/reflections/date/${date}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch reflection by date';
    throw message;
  }
};

/**
 * Fetch reflection metrics and statistics
 * @returns {Promise<object>} Stats object
 */
export const getReflectionStats = async () => {
  try {
    const response = await api.get('/reflections/stats');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch reflection statistics';
    throw message;
  }
};

/**
 * Create a new journal entry
 * @param {object} reflectionData 
 * @returns {Promise<object>} Created reflection
 */
export const createReflection = async (reflectionData) => {
  try {
    const response = await api.post('/reflections', reflectionData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to create reflection';
    throw message;
  }
};

/**
 * Edit an existing reflection entry
 * @param {string} id 
 * @param {object} data 
 * @returns {Promise<object>} Updated reflection
 */
export const updateReflection = async (id, data) => {
  try {
    const response = await api.put(`/reflections/${id}`, data);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to update reflection';
    throw message;
  }
};

/**
 * Soft delete a reflection entry
 * @param {string} id 
 * @returns {Promise<object>} Confirmation message
 */
export const deleteReflection = async (id) => {
  try {
    const response = await api.delete(`/reflections/${id}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to delete reflection';
    throw message;
  }
};
