/**
 * api.js — Axios instance and base service configuration
 * All API calls in this project should use this configured instance.
 */

import axios from 'axios';

/**
 * Pre-configured Axios instance.
 * The Vite proxy forwards `/api` requests to http://localhost:5000 in dev.
 * In production, set VITE_API_BASE_URL in your environment.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies with cross-origin requests
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Automatically attach the JWT token from localStorage to every request.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
// Handle global errors (e.g., 401 Unauthorized → redirect to login).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear storage and redirect
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
