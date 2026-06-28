/**
 * useTheme.js — Re-export hook for accessing ThemeContext
 *
 * Usage:
 *   import useTheme from '../hooks/useTheme';
 *   const { theme, activeTheme, setTheme, toggleTheme } = useTheme();
 */

export { useTheme } from '../context/ThemeContext';
export { useTheme as default } from '../context/ThemeContext';
