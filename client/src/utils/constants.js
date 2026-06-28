/**
 * utils/constants.js — Global constants and static configs used across the GritFlow app
 */

export const MOOD_LABELS = ['Terrible', 'Bad', 'Okay', 'Good', 'Amazing'];

export const MOOD_EMOJIS = ['😢', '😔', '😐', '🙂', '😁'];

export const CATEGORIES = ['health', 'career', 'education', 'finance', 'personal', 'other'];

export const PRIORITY_LEVELS = ['low', 'medium', 'high'];

export const HABIT_FREQUENCIES = ['daily', 'weekly'];

export const TIMER_MODES = ['focus', 'short_break', 'long_break'];

export const DEFAULT_SETTINGS = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
  autoStartBreaks: false,
  autoStartFocus: false,
};

export const MOTIVATIONAL_QUOTES = [
  "Believe you can and you're halfway there.",
  "Your only limit is you.",
  "Action is the foundational key to all success.",
  "Small daily improvements over time lead to stunning results.",
  "It does not matter how slowly you go as long as you do not stop.",
  "Don't count the days, make the days count.",
  "The secret of getting ahead is getting started.",
  "Stay focused, go after your dreams and keep moving toward your goals.",
  "Strive for progress, not perfection.",
  "Consistency is the key that unlocks the door to habit building.",
  "You do not find a happy life. You make it.",
  "Focus on being productive instead of busy.",
  "If you want to live a happy life, tie it to a goal, not to people or things.",
  "Hardships often prepare ordinary people for an extraordinary destiny.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "Gratitude turns what we have into enough.",
  "Energy and persistence conquer all things.",
  "The only way to do great work is to love what you do.",
  "Every moment is a fresh beginning.",
  "Cultivate the habit of being grateful for every good thing that comes to you."
];

export const ACHIEVEMENT_CATEGORIES = ['habits', 'goals', 'reflection', 'focus', 'gratitude', 'general'];

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  HABITS: '/dashboard/habits',
  GOALS: '/dashboard/goals',
  REFLECTION: '/dashboard/reflection',
  FOCUS: '/dashboard/focus',
  GRATITUDE: '/dashboard/gratitude',
  STATS: '/dashboard/stats',
  ACHIEVEMENTS: '/dashboard/achievements',
  SETTINGS: '/dashboard/settings',
};

export const NAV_LINKS = [
  { name: 'Overview', path: ROUTES.DASHBOARD, icon: '🏠' },
  { name: 'Habit Tracker', path: ROUTES.HABITS, icon: '✅' },
  { name: 'Goals', path: ROUTES.GOALS, icon: '🎯' },
  { name: 'Reflection', path: ROUTES.REFLECTION, icon: '📓' },
  { name: 'Focus Timer', path: ROUTES.FOCUS, icon: '⏱️' },
  { name: 'Gratitude', path: ROUTES.GRATITUDE, icon: '🙏' },
  { name: 'Statistics', path: ROUTES.STATS, icon: '📊' },
  { name: 'Achievements', path: ROUTES.ACHIEVEMENTS, icon: '🏆' },
  { name: 'Settings', path: ROUTES.SETTINGS, icon: '⚙️' },
];
