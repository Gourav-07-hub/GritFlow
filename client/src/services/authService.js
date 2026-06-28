/**
 * authService.js — Authentication API services
 * Handles registration and login API calls.
 */

import api from './axiosConfig';

/**
 * Register a new user
 * @param {string} name 
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<object>} The registered user data and token
 */
export const registerUser = async (name, email, password) => {
  try {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
    throw errorMessage;
  }
};

/**
 * Log in an existing user
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<object>} The logged in user data and token
 */
export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Login failed';
    throw errorMessage;
  }
};
