/**
 * useFocusStats.js — Custom React hook for focus stats and history sessions management
 */

import { useState, useEffect, useCallback } from 'react';
import { getFocusStats, getSessions, deleteSession } from '../services/focusService';

const getTodayString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function useFocusStats() {
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Stats
  const fetchStats = useCallback(async () => {
    try {
      const data = await getFocusStats();
      setStats(data);
    } catch (err) {
      if (err.response?.status !== 429) {
        setError(err);
      }
    }
  }, []);

  // Fetch Sessions (defaults to today's date)
  const fetchSessions = useCallback(async (date = getTodayString(), type) => {
    setLoading(true);
    try {
      const data = await getSessions(date, type);
      setSessions(data || []);
    } catch (err) {
      if (err.response?.status !== 429) {
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Remove focus session
  const removeSession = useCallback(async (id) => {
    try {
      await deleteSession(id);
      // Remove from local list
      setSessions((prev) => prev.filter((s) => s._id !== id));
      // Re-trigger stats fetch to keep stats in sync
      fetchStats();
    } catch (err) {
      if (err.response?.status !== 429) {
        setError(err);
      }
      throw err;
    }
  }, [fetchStats]);

  // Initial load
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([fetchStats(), fetchSessions()]);
      } catch (err) {
        if (err.response?.status !== 429) {
          setError(err);
        }
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, [fetchStats, fetchSessions]);

  return {
    stats,
    sessions,
    loading,
    error,
    fetchStats,
    fetchSessions,
    removeSession,
  };
}
