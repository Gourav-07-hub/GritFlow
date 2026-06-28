import { useState, useEffect, useCallback } from 'react';
import {
  getAchievements,
  checkAchievements,
  getAchievementStats,
} from '../services/achievementService';

export default function useAchievements() {
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState(null);
  const [newlyUnlocked, setNewlyUnlocked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAchievements = useCallback(async (showLoading = true) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const [achList, statsData] = await Promise.all([
        getAchievements(),
        getAchievementStats(),
      ]);
      setAchievements(achList);
      setStats(statsData);
    } catch (err) {
      setError(err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  const triggerCheck = useCallback(async () => {
    setError(null);
    try {
      const newUnlocks = await checkAchievements();
      if (newUnlocks && newUnlocks.length > 0) {
        setNewlyUnlocked((prev) => [...prev, ...newUnlocks]);
        // Refresh achievements and stats if anything new was unlocked
        await fetchAchievements(false);
      }
      return newUnlocks;
    } catch (err) {
      setError(err);
      return [];
    }
  }, [fetchAchievements]);

  const clearNewlyUnlocked = useCallback(() => {
    setNewlyUnlocked([]);
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  return {
    achievements,
    stats,
    newlyUnlocked,
    loading,
    error,
    fetchAchievements,
    triggerCheck,
    clearNewlyUnlocked,
  };
}
