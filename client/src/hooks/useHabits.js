/**
 * useHabits.js — Custom hook to manage habit states and side effects
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getHabits,
  createHabit,
  updateHabit,
  deleteHabit,
  toggleHabitComplete,
} from '../services/habitService';

/**
 * Custom useHabits hook
 * Handles API calls, local state sync, loading, and error states.
 */
function useHabits() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memoized fetch habits function
  const fetchHabitsList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHabits();
      setHabits(data || []);
    } catch (err) {
      if (err.response?.status !== 429) {
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Create habit
  const addHabit = async (habitData) => {
    setError(null);
    try {
      const newHabit = await createHabit(habitData);
      setHabits((prev) => [...prev, newHabit]);
      window.dispatchEvent(new CustomEvent('check-achievements'));
      return newHabit;
    } catch (err) {
      if (err.response?.status !== 429) {
        setError(err);
      }
      throw err;
    }
  };

  // Update habit
  const editHabit = async (id, habitData) => {
    setError(null);
    try {
      const updatedHabit = await updateHabit(id, habitData);
      setHabits((prev) =>
        prev.map((h) => (h._id === id ? updatedHabit : h))
      );
      window.dispatchEvent(new CustomEvent('check-achievements'));
      return updatedHabit;
    } catch (err) {
      if (err.response?.status !== 429) {
        setError(err);
      }
      throw err;
    }
  };

  // Soft delete habit
  const removeHabit = async (id) => {
    setError(null);
    try {
      await deleteHabit(id);
      setHabits((prev) => prev.filter((h) => h._id !== id));
      window.dispatchEvent(new CustomEvent('check-achievements'));
    } catch (err) {
      if (err.response?.status !== 429) {
        setError(err);
      }
      throw err;
    }
  };

  // Toggle completion
  const toggleComplete = async (id) => {
    setError(null);
    try {
      const updatedHabit = await toggleHabitComplete(id);
      setHabits((prev) =>
        prev.map((h) => (h._id === id ? updatedHabit : h))
      );
      window.dispatchEvent(new CustomEvent('check-achievements'));
      return updatedHabit;
    } catch (err) {
      if (err.response?.status !== 429) {
        setError(err);
      }
      throw err;
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchHabitsList();
  }, [fetchHabitsList]);

  return {
    habits,
    loading,
    error,
    fetchHabits: fetchHabitsList,
    addHabit,
    editHabit,
    removeHabit,
    toggleComplete,
  };
}

export default useHabits;
