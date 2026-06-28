/**
 * useSettings.js — Custom hook to manage User Settings page state and logic
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  getProfile,
  updateProfile,
  changePassword,
  getPreferences,
  updatePreferences,
  deleteAccount,
  getAccountStats,
} from '../services/settingsService';

export default function useSettings() {
  const { logout, setUser } = useAuth();
  const { setTheme } = useTheme();

  const [profile, setProfile] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [accountStats, setAccountStats] = useState(null);
  
  const [loading, setLoading] = useState({
    profile: true,
    preferences: true,
    stats: true,
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Clear messages handler
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  // Auto-clear success/error notifications after 4 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        clearMessages();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [success, error, clearMessages]);

  // Fetch actions
  const fetchProfile = useCallback(async () => {
    setLoading((prev) => ({ ...prev, profile: true }));
    try {
      const data = await getProfile();
      setProfile(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading((prev) => ({ ...prev, profile: false }));
    }
  }, []);

  const fetchPreferences = useCallback(async () => {
    setLoading((prev) => ({ ...prev, preferences: true }));
    try {
      const data = await getPreferences();
      setPreferences(data);
      if (data && data.theme) {
        setTheme(data.theme);
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading((prev) => ({ ...prev, preferences: false }));
    }
  }, [setTheme]);

  const fetchAccountStats = useCallback(async () => {
    setLoading((prev) => ({ ...prev, stats: true }));
    try {
      const data = await getAccountStats();
      setAccountStats(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading((prev) => ({ ...prev, stats: false }));
    }
  }, []);

  // Save profile
  const saveProfile = async (data) => {
    setError(null);
    setSuccess(null);
    setLoading((prev) => ({ ...prev, profile: true }));
    try {
      const updated = await updateProfile(data);
      setProfile(updated);
      setSuccess('Profile updated successfully ✅');
      
      // Update local storage user information if display name or avatar changed
      const localUser = localStorage.getItem('user');
      if (localUser) {
        const parsed = JSON.parse(localUser);
        localStorage.setItem(
          'user',
          JSON.stringify({ ...parsed, name: updated.name, avatar: updated.avatar })
        );
      }
      if (setUser) {
        setUser((prev) => prev ? { ...prev, name: updated.name, avatar: updated.avatar } : null);
      }
      return updated;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading((prev) => ({ ...prev, profile: false }));
    }
  };

  // Update password
  const updatePassword = async (data) => {
    setError(null);
    setSuccess(null);
    try {
      const result = await changePassword(data);
      setSuccess('Password changed successfully ✅');
      return result;
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  // Save preferences
  const savePreferences = async (data) => {
    setError(null);
    setSuccess(null);
    setLoading((prev) => ({ ...prev, preferences: true }));
    try {
      const updated = await updatePreferences(data);
      setPreferences(updated);
      setSuccess('Preferences saved successfully ✅');
      if (updated && updated.theme) {
        setTheme(updated.theme);
      }
      return updated;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading((prev) => ({ ...prev, preferences: false }));
    }
  };

  // Delete account permanently
  const removeAccount = async (password) => {
    setError(null);
    setSuccess(null);
    try {
      await deleteAccount(password);
      setSuccess('Account deleted successfully ✅');
      // Trigger logout context state and redirect
      logout();
      window.location.href = '/login';
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  // Trigger all loads on mount
  useEffect(() => {
    fetchProfile();
    fetchPreferences();
    fetchAccountStats();
  }, [fetchProfile, fetchPreferences, fetchAccountStats]);

  return {
    profile,
    preferences,
    accountStats,
    loading,
    error,
    success,
    fetchProfile,
    saveProfile,
    updatePassword,
    fetchPreferences,
    savePreferences,
    fetchAccountStats,
    removeAccount,
    clearMessages,
  };
}
