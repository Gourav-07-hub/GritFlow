/**
 * ThemeContext.jsx — Global theme / dark-mode state
 * Provides theme toggle functionality with system preference detection.
 *
 * Supports three modes:
 *   - 'light'  → always light
 *   - 'dark'   → always dark
 *   - 'system' → follows OS preference via matchMedia
 */

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const STORAGE_KEY = 'gritflow-theme';

const ThemeContext = createContext(null);

/**
 * Resolve 'system' theme to 'light' or 'dark' based on OS preference.
 * @returns {'light' | 'dark'}
 */
function getSystemTheme() {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * ThemeProvider — wraps the app and syncs theme to <html> data-theme attribute.
 * @param {{ children: React.ReactNode }} props
 */
export function ThemeProvider({ children }) {
  // Stored preference: 'light' | 'dark' | 'system'
  const [theme, setThemeState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
      // Migrate from old storage key if present
      const oldStored = localStorage.getItem('theme');
      if (oldStored === 'light' || oldStored === 'dark') return oldStored;
    } catch (_e) { /* localStorage unavailable */ }
    return 'dark';
  });

  // Resolved theme that is actually applied: 'light' | 'dark'
  const [activeTheme, setActiveTheme] = useState(() =>
    theme === 'system' ? getSystemTheme() : theme
  );

  // Update resolved theme when the stored preference changes
  useEffect(() => {
    if (theme === 'system') {
      setActiveTheme(getSystemTheme());
    } else {
      setActiveTheme(theme);
    }
  }, [theme]);

  // Listen for OS theme changes when mode is 'system'
  useEffect(() => {
    if (theme !== 'system') return;

    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setActiveTheme(e.matches ? 'dark' : 'light');
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [theme]);

  // Apply resolved theme to document root and persist preference
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', activeTheme);
  }, [activeTheme]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (_e) { /* localStorage unavailable */ }
  }, [theme]);

  /**
   * Set theme preference explicitly.
   * @param {'light' | 'dark' | 'system'} newTheme
   */
  const setTheme = useCallback((newTheme) => {
    if (['light', 'dark', 'system'].includes(newTheme)) {
      setThemeState(newTheme);
    }
  }, []);

  /**
   * Toggle between light and dark only (ignores system).
   */
  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const current = prev === 'system' ? getSystemTheme() : prev;
      return current === 'dark' ? 'light' : 'dark';
    });
  }, []);

  const value = useMemo(() => ({
    theme,        // stored preference: 'light' | 'dark' | 'system'
    activeTheme,  // resolved theme: 'light' | 'dark'
    setTheme,
    toggleTheme,
  }), [theme, activeTheme, setTheme, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Custom hook to access theme context.
 * @returns {{ theme: string, activeTheme: string, setTheme: Function, toggleTheme: Function }}
 */
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a <ThemeProvider>');
  return ctx;
}

export default ThemeContext;
