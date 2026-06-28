import axios from 'axios';

// Ensure the baseURL has the /api suffix appropriately
const rawBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const baseURL = rawBaseURL.endsWith('/api') ? rawBaseURL : `${rawBaseURL}/api`;

const axiosInstance = axios.create({
  baseURL,
  timeout: 10000, // 10 seconds timeout
  headers: {},
  withCredentials: true,
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper to dispatch global toast events
const showWarning = (message) => {
  window.dispatchEvent(
    new CustomEvent('show-toast', {
      detail: { message, type: 'warning' },
    })
  );
};

// ─── Response Interceptor ─────────────────────────────────────────────────────
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 429 Too Many Requests
    if (error.response?.status === 429) {
      showWarning('Too many requests — please wait a moment and try again');
      return Promise.reject(error);
    }

    // 1. Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Dispatch event to clear auth state
      window.dispatchEvent(new CustomEvent('auth-logout'));
      
      // Only redirect if not already on login/register pages
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    // 2. Handle Timeouts
    if (error.code === 'ECONNABORTED' || error.message.toLowerCase().includes('timeout')) {
      window.dispatchEvent(
        new CustomEvent('show-toast', {
          detail: { message: 'Request timed out, check your connection', type: 'error' },
        })
      );
      return Promise.reject(error);
    }

    // 3. Handle 500 Server Errors
    if (error.response?.status >= 500) {
      window.dispatchEvent(
        new CustomEvent('show-toast', {
          detail: { message: 'Server error, try again', type: 'error' },
        })
      );
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
