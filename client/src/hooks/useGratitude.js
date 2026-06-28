/**
 * useGratitude.js — Custom hook to manage gratitude journal state and API calls
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getGratitudeEntries,
  getGratitudeStats,
  createGratitudeEntry,
  updateGratitudeEntry,
  deleteGratitudeEntry,
  toggleFavoriteItem,
} from '../services/gratitudeService';

const getCurrentMonthString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export default function useGratitude() {
  const [entries, setEntries] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterFavorite, setFilterFavorite] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthString());

  // Fetch Stats
  const fetchStats = useCallback(async () => {
    try {
      const data = await getGratitudeStats();
      setStats(data);
    } catch (err) {
      if (err.response?.status !== 429) {
        setError(err);
      }
    }
  }, []);

  // Fetch Entries
  const fetchEntries = useCallback(async (month, favorite) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getGratitudeEntries(month, favorite);
      setEntries(data || []);
    } catch (err) {
      if (err.response?.status !== 429) {
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync entries and stats when month/favorite filter changes
  useEffect(() => {
    fetchEntries(selectedMonth, filterFavorite);
  }, [selectedMonth, filterFavorite, fetchEntries]);

  // Initial fetch for stats
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Create Entry
  const addEntry = async (data) => {
    setError(null);
    try {
      const newEntry = await createGratitudeEntry(data);
      // Re-fetch current month entries and stats to synchronize
      await Promise.all([fetchEntries(selectedMonth, filterFavorite), fetchStats()]);
      window.dispatchEvent(new CustomEvent('check-achievements'));
      return newEntry;
    } catch (err) {
      if (err.response?.status !== 429) {
        setError(err);
      }
      throw err;
    }
  };

  // Edit Entry
  const editEntry = async (id, data) => {
    setError(null);
    try {
      const updatedEntry = await updateGratitudeEntry(id, data);
      setEntries((prev) => prev.map((e) => (e._id === id ? updatedEntry : e)));
      await fetchStats();
      window.dispatchEvent(new CustomEvent('check-achievements'));
      return updatedEntry;
    } catch (err) {
      if (err.response?.status !== 429) {
        setError(err);
      }
      throw err;
    }
  };

  // Delete/Remove Entry
  const removeEntry = async (id) => {
    setError(null);
    try {
      await deleteGratitudeEntry(id);
      setEntries((prev) => prev.filter((e) => e._id !== id));
      await fetchStats();
      window.dispatchEvent(new CustomEvent('check-achievements'));
    } catch (err) {
      if (err.response?.status !== 429) {
        setError(err);
      }
      throw err;
    }
  };

  // Toggle Favorite item
  const toggleFavorite = async (entryId, itemId) => {
    setError(null);
    try {
      const updatedEntry = await toggleFavoriteItem(entryId, itemId);
      setEntries((prev) => prev.map((e) => (e._id === entryId ? updatedEntry : e)));
      await fetchStats();
      window.dispatchEvent(new CustomEvent('check-achievements'));
      return updatedEntry;
    } catch (err) {
      if (err.response?.status !== 429) {
        setError(err);
      }
      throw err;
    }
  };

  return {
    entries,
    stats,
    loading,
    error,
    filterFavorite,
    selectedMonth,
    fetchEntries,
    fetchStats,
    addEntry,
    editEntry,
    removeEntry,
    toggleFavorite,
    setFilterFavorite,
    setSelectedMonth,
  };
}
