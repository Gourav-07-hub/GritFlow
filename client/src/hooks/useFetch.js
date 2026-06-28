/**
 * useFetch.js — Generic data-fetching hook
 * Wraps the shared axios instance with loading / error / data state.
 *
 * @example
 * const { data, loading, error } = useFetch('/health');
 */

import { useState, useEffect } from 'react';
import api from '../services/axiosConfig';

/**
 * @param {string} endpoint - Relative API endpoint (e.g., '/health')
 * @param {object} [options] - Additional axios request config
 */
function useFetch(endpoint, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true; // Prevent state update on unmounted component

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get(endpoint, options);
        if (isMounted) setData(response.data);
      } catch (err) {
        if (isMounted) setError(err.response?.data?.message || err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false; // Cleanup on unmount
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  return { data, loading, error };
}

export default useFetch;
