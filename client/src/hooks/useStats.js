/**
 * useStats.js — Custom hook to load and manage Statistics Dashboard states
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getOverviewStats,
  getActivityHeatmap,
  getWeeklyReport,
  getMonthlyReport,
  getStreakLeaderboard,
} from '../services/statsService';

const getCurrentMonthString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export default function useStats() {
  const [overview, setOverview] = useState(null);
  const [heatmap, setHeatmap] = useState([]);
  const [weeklyReport, setWeeklyReport] = useState(null);
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [streaks, setStreaks] = useState([]);
  
  const [loading, setLoading] = useState({
    overview: true,
    heatmap: true,
    weekly: true,
    monthly: true,
    streaks: true,
  });

  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthString());

  // Individual fetchers
  const fetchOverview = useCallback(async () => {
    setLoading((prev) => ({ ...prev, overview: true }));
    try {
      const data = await getOverviewStats();
      setOverview(data);
    } catch (err) {
      if (err.response?.status !== 429) {
        setError(err);
      }
    } finally {
      setLoading((prev) => ({ ...prev, overview: false }));
    }
  }, []);

  const fetchHeatmap = useCallback(async () => {
    setLoading((prev) => ({ ...prev, heatmap: true }));
    try {
      const data = await getActivityHeatmap();
      setHeatmap(data || []);
    } catch (err) {
      if (err.response?.status !== 429) {
        setError(err);
      }
    } finally {
      setLoading((prev) => ({ ...prev, heatmap: false }));
    }
  }, []);

  const fetchWeeklyReport = useCallback(async () => {
    setLoading((prev) => ({ ...prev, weekly: true }));
    try {
      const data = await getWeeklyReport();
      setWeeklyReport(data);
    } catch (err) {
      if (err.response?.status !== 429) {
        setError(err);
      }
    } finally {
      setLoading((prev) => ({ ...prev, weekly: false }));
    }
  }, []);

  const fetchMonthlyReport = useCallback(async (month) => {
    setLoading((prev) => ({ ...prev, monthly: true }));
    try {
      const data = await getMonthlyReport(month);
      setMonthlyReport(data);
    } catch (err) {
      if (err.response?.status !== 429) {
        setError(err);
      }
    } finally {
      setLoading((prev) => ({ ...prev, monthly: false }));
    }
  }, []);

  const fetchStreaks = useCallback(async () => {
    setLoading((prev) => ({ ...prev, streaks: true }));
    try {
      const data = await getStreakLeaderboard();
      setStreaks(data || []);
    } catch (err) {
      if (err.response?.status !== 429) {
        setError(err);
      }
    } finally {
      setLoading((prev) => ({ ...prev, streaks: false }));
    }
  }, []);

  const fetchAll = useCallback(() => {
    setError(null);
    fetchOverview();
    fetchHeatmap();
    fetchWeeklyReport();
    fetchMonthlyReport(selectedMonth);
    fetchStreaks();
  }, [fetchOverview, fetchHeatmap, fetchWeeklyReport, fetchMonthlyReport, fetchStreaks, selectedMonth]);

  // Load everything on initial mount
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Load new monthly report whenever the month selection updates
  useEffect(() => {
    fetchMonthlyReport(selectedMonth);
  }, [selectedMonth, fetchMonthlyReport]);

  return {
    overview,
    heatmap,
    weeklyReport,
    monthlyReport,
    streaks,
    loading,
    error,
    selectedMonth,
    fetchOverview,
    fetchHeatmap,
    fetchWeeklyReport,
    fetchMonthlyReport,
    fetchStreaks,
    fetchAll,
    setSelectedMonth,
  };
}
