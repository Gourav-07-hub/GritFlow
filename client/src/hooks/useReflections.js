/**
 * useReflections.js — Custom hook to manage reflection journal states and API sync
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getReflections,
  getReflectionStats,
  createReflection,
  updateReflection,
  deleteReflection,
} from '../services/reflectionService';

/**
 * Custom useReflections hook
 */
function useReflections() {
  const [reflections, setReflections] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  // Fetch reflections list (optionally filtered by month YYYY-MM)
  const fetchReflectionsList = useCallback(async (month) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getReflections(month);
      setReflections(data || []);
    } catch (err) {
      if (err.response?.status !== 429) {
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch journal statistics
  const fetchStatsData = useCallback(async () => {
    setError(null);
    try {
      const data = await getReflectionStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  // Add reflection
  const addReflection = async (reflectionData) => {
    setError(null);
    try {
      const created = await createReflection(reflectionData);
      setReflections((prev) => [created, ...prev]);
      await fetchStatsData(); // Refresh stats
      window.dispatchEvent(new CustomEvent('check-achievements'));
      return created;
    } catch (err) {
      if (err.response?.status !== 429) {
        setError(err);
      }
      throw err;
    }
  };

  // Edit reflection
  const editReflection = async (id, data) => {
    setError(null);
    try {
      const updated = await updateReflection(id, data);
      setReflections((prev) =>
        prev.map((r) => (r._id === id ? updated : r))
      );
      await fetchStatsData(); // Refresh stats
      window.dispatchEvent(new CustomEvent('check-achievements'));
      return updated;
    } catch (err) {
      if (err.response?.status !== 429) {
        setError(err);
      }
      throw err;
    }
  };

  // Delete reflection
  const removeReflection = async (id) => {
    setError(null);
    try {
      await deleteReflection(id);
      setReflections((prev) => prev.filter((r) => r._id !== id));
      await fetchStatsData(); // Refresh stats
      window.dispatchEvent(new CustomEvent('check-achievements'));
    } catch (err) {
      if (err.response?.status !== 429) {
        setError(err);
      }
      throw err;
    }
  };

  // Initial mount load
  useEffect(() => {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    fetchReflectionsList(currentMonth);
    fetchStatsData();
  }, [fetchReflectionsList, fetchStatsData]);

  return {
    reflections,
    stats,
    loading,
    error,
    selectedDate,
    fetchReflections: fetchReflectionsList,
    fetchStats: fetchStatsData,
    addReflection,
    editReflection,
    removeReflection,
    setSelectedDate,
  };
}

export default useReflections;
