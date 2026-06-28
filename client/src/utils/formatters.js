/**
 * utils/formatters.js — Reusable client-side formatting helper functions
 */

export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
};

export const formatDateShort = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export const formatDateFull = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

export const formatTimeAgo = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const now = new Date();
  const seconds = Math.floor((now - d) / 1000);

  if (seconds < 5) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;

  const months = Math.floor(days / 30);
  return `${months}mo ago`;
};

export const formatDuration = (minutes) => {
  if (typeof minutes !== 'number' || isNaN(minutes) || minutes <= 0) return '0m';
  if (minutes < 60) return `${minutes}m`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
};

export const formatStreak = (days) => {
  const count = typeof days === 'number' ? days : 0;
  return count === 1 ? '1 day' : `${count} days`;
};

export const formatProgress = (value) => {
  const percent = typeof value === 'number' ? value : 0;
  return `${Math.round(percent)}%`;
};

export const getInitials = (name) => {
  if (!name || typeof name !== 'string') return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const getDaysLeft = (deadline) => {
  if (!deadline) return '';
  const d = new Date(deadline);
  if (isNaN(d.getTime())) return '';
  const now = new Date();
  
  // Set times to midnight to calculate exact difference in calendar days
  d.setHours(0, 0, 0, 0);
  const tempNow = new Date(now);
  tempNow.setHours(0, 0, 0, 0);

  const diffTime = d - tempNow;
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'Overdue';
  if (diffDays === 0) return 'Due today';
  if (diffDays === 1) return '1 day left';
  return `${diffDays} days left`;
};

export const getMoodEmoji = (mood) => {
  const index = Math.max(1, Math.min(5, Math.round(mood))) - 1;
  const emojis = ['😢', '😔', '😐', '🙂', '😁'];
  return emojis[index] || '😐';
};

export const getMoodLabel = (mood) => {
  const index = Math.max(1, Math.min(5, Math.round(mood))) - 1;
  const labels = ['Terrible', 'Bad', 'Okay', 'Good', 'Amazing'];
  return labels[index] || 'Okay';
};

export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

export const capitalizeFirst = (string) => {
  if (typeof string !== 'string' || string.length === 0) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const truncateText = (text, maxLength) => {
  if (typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};
