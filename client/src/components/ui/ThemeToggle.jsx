/**
 * ThemeToggle.jsx — Animated theme toggle button for the navbar
 *
 * Shows sun icon when dark mode is active (click → switch to light)
 * Shows moon icon when light mode is active (click → switch to dark)
 */

import { useTheme } from '../../context/ThemeContext';

function ThemeToggle() {
  const { activeTheme, toggleTheme } = useTheme();

  const isDark = activeTheme === 'dark';
  const label = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';

  return (
    <button
      className="icon-btn"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      type="button"
    >
      <span className={`theme-icon ${isDark ? 'icon-sun' : 'icon-moon'}`}>
        {isDark ? 'Sun' : 'Moon'}
      </span>
    </button>
  );
}

export default ThemeToggle;
