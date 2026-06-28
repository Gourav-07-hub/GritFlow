/**
 * useGoals.js — Custom hook to manage goal states and side effects
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  updateGoalProgress,
  toggleMilestone,
} from '../services/goalService';

/**
 * Custom useGoals hook
 * Encapsulates data retrieval, mutation, loading and error states for Goals.
 */
function useGoals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memoized fetch function
  const fetchGoalsList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getGoals();
      setGoals(data || []);
    } catch (err) {
      if (err.response?.status !== 429) {
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Add goal
  const addGoal = async (goalData) => {
    setError(null);
    try {
      const newGoal = await createGoal(goalData);
      setGoals((prev) => [...prev, newGoal]);
      window.dispatchEvent(new CustomEvent('check-achievements'));
      return newGoal;
    } catch (err) {
      if (err.response?.status !== 429) {
        setError(err);
      }
      throw err;
    }
  };

  // Edit goal
  const editGoal = async (id, goalData) => {
    setError(null);
    try {
      const updatedGoal = await updateGoal(id, goalData);
      setGoals((prev) =>
        prev.map((g) => (g._id === id ? updatedGoal : g))
      );
      window.dispatchEvent(new CustomEvent('check-achievements'));
      return updatedGoal;
    } catch (err) {
      if (err.response?.status !== 429) {
        setError(err);
      }
      throw err;
    }
  };

  // Delete goal
  const removeGoal = async (id) => {
    setError(null);
    try {
      await deleteGoal(id);
      setGoals((prev) => prev.filter((g) => g._id !== id));
      window.dispatchEvent(new CustomEvent('check-achievements'));
    } catch (err) {
      if (err.response?.status !== 429) {
        setError(err);
      }
      throw err;
    }
  };

  // Update progress manually (when there are no milestones)
  const updateProgress = async (id, progress) => {
    setError(null);
    try {
      const updatedGoal = await updateGoalProgress(id, progress);
      setGoals((prev) =>
        prev.map((g) => (g._id === id ? updatedGoal : g))
      );
      window.dispatchEvent(new CustomEvent('check-achievements'));
      return updatedGoal;
    } catch (err) {
      if (err.response?.status !== 429) {
        setError(err);
      }
      throw err;
    }
  };

  // Toggle milestone completion state
  const completeMilestone = async (goalId, milestoneId) => {
    setError(null);
    try {
      const updatedGoal = await toggleMilestone(goalId, milestoneId);
      setGoals((prev) =>
        prev.map((g) => (g._id === goalId ? updatedGoal : g))
      );
      window.dispatchEvent(new CustomEvent('check-achievements'));
      return updatedGoal;
    } catch (err) {
      if (err.response?.status !== 429) {
        setError(err);
      }
      throw err;
    }
  };

  // Auto-fetch on mount
  useEffect(() => {
    fetchGoalsList();
  }, [fetchGoalsList]);

  return {
    goals,
    loading,
    error,
    fetchGoals: fetchGoalsList,
    addGoal,
    editGoal,
    removeGoal,
    updateProgress,
    completeMilestone,
  };
}

export default useGoals;
