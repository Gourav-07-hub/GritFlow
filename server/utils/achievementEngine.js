import Habit from '../models/Habit.js';
import Goal from '../models/Goal.js';
import Reflection from '../models/Reflection.js';
import FocusSession from '../models/FocusSession.js';
import Gratitude from '../models/Gratitude.js';
import Achievement from '../models/Achievement.js';
import Notification from '../models/Notification.js';

// Define the full list of achievements to check
export const ACHIEVEMENT_DEFINITIONS = [
  // habits
  {
    key: 'first_habit',
    title: 'First Step',
    description: 'Created your first habit',
    icon: '🏃',
    category: 'habits',
  },
  {
    key: 'habit_7_streak',
    title: 'Week Warrior',
    description: 'Maintained a 7-day habit streak',
    icon: '🔥',
    category: 'habits',
  },
  {
    key: 'habit_30_streak',
    title: 'Monthly Master',
    description: 'Maintained a 30-day habit streak',
    icon: '💪',
    category: 'habits',
  },
  {
    key: 'habit_100_streak',
    title: 'Century Club',
    description: 'Maintained a 100-day habit streak',
    icon: '🏆',
    category: 'habits',
  },
  {
    key: 'five_habits',
    title: 'Habit Builder',
    description: 'Created 5 or more habits',
    icon: '✅',
    category: 'habits',
  },
  {
    key: 'perfect_week',
    title: 'Perfect Week',
    description: 'Completed all habits for 7 days straight',
    icon: '⭐',
    category: 'habits',
  },
  // goals
  {
    key: 'first_goal',
    title: 'Goal Setter',
    description: 'Set your first goal',
    icon: '🎯',
    category: 'goals',
  },
  {
    key: 'first_goal_done',
    title: 'Goal Crusher',
    description: 'Completed your first goal',
    icon: '🏅',
    category: 'goals',
  },
  {
    key: 'five_goals_done',
    title: 'Achiever',
    description: 'Completed 5 goals',
    icon: '🎖️',
    category: 'goals',
  },
  {
    key: 'milestone_master',
    title: 'Milestone Master',
    description: 'Completed 20 milestones across all goals',
    icon: '📍',
    category: 'goals',
  },
  // reflection
  {
    key: 'first_reflection',
    title: 'Self Aware',
    description: 'Wrote your first reflection',
    icon: '📓',
    category: 'reflection',
  },
  {
    key: 'reflect_7_streak',
    title: 'Growing Mind',
    description: 'Reflected for 7 days in a row',
    icon: '🌱',
    category: 'reflection',
  },
  {
    key: 'reflect_30_streak',
    title: 'Deep Thinker',
    description: 'Reflected for 30 days in a row',
    icon: '🧠',
    category: 'reflection',
  },
  {
    key: 'reflect_100_days',
    title: 'Journal Legend',
    description: 'Written 100 reflection entries',
    icon: '📚',
    category: 'reflection',
  },
  // focus
  {
    key: 'first_focus',
    title: 'First Focus',
    description: 'Completed your first focus session',
    icon: '⏱️',
    category: 'focus',
  },
  {
    key: 'focus_10_hours',
    title: 'Focus Apprentice',
    description: 'Accumulated 10 hours of focus time',
    icon: '🎯',
    category: 'focus',
  },
  {
    key: 'focus_50_hours',
    title: 'Focus Expert',
    description: 'Accumulated 50 hours of focus time',
    icon: '💡',
    category: 'focus',
  },
  {
    key: 'focus_100_hours',
    title: 'Focus Master',
    description: 'Accumulated 100 hours of focus time',
    icon: '🔬',
    category: 'focus',
  },
  {
    key: 'focus_7_streak',
    title: 'Consistent Focuser',
    description: 'Focused for 7 consecutive days',
    icon: '📅',
    category: 'focus',
  },
  // gratitude
  {
    key: 'first_gratitude',
    title: 'Grateful Heart',
    description: 'Wrote your first gratitude entry',
    icon: '🙏',
    category: 'gratitude',
  },
  {
    key: 'grateful_7_streak',
    title: 'Gratitude Habit',
    description: 'Practiced gratitude for 7 days in a row',
    icon: '🌸',
    category: 'gratitude',
  },
  {
    key: 'grateful_30_streak',
    title: 'Gratitude Master',
    description: 'Practiced gratitude for 30 days in a row',
    icon: '🌺',
    category: 'gratitude',
  },
  {
    key: 'hundred_items',
    title: 'Gratitude Collector',
    description: 'Recorded 100 things to be grateful for',
    icon: '💎',
    category: 'gratitude',
  },
  // general
  {
    key: 'all_features',
    title: 'GritFlow Pro',
    description: 'Used all 5 features at least once',
    icon: '🌟',
    category: 'general',
  },
  {
    key: 'seven_day_active',
    title: 'Week Streak',
    description: 'Active on the dashboard for 7 days in a row',
    icon: '🗓️',
    category: 'general',
  },
  {
    key: 'thirty_day_active',
    title: 'Monthly Champion',
    description: 'Active on the dashboard for 30 days in a row',
    icon: '📆',
    category: 'general',
  },
];

/**
 * Calculates the longest consecutive streak of days from an array of Date objects or strings.
 * @param {Array<Date|string>} dates
 * @returns {number} Longest streak in days
 */
function getLongestStreak(dates) {
  if (!dates || dates.length === 0) return 0;

  // Format dates to YYYY-MM-DD strings using UTC to avoid daylight saving/timezone offset jumps
  const formattedDates = dates
    .map((d) => {
      const dateObj = new Date(d);
      if (isNaN(dateObj.getTime())) return null;
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    })
    .filter(Boolean);

  // Sort unique dates ascending
  const uniqueDates = [...new Set(formattedDates)].sort();
  if (uniqueDates.length === 0) return 0;

  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = new Date(uniqueDates[i - 1] + 'T00:00:00Z');
    const currDate = new Date(uniqueDates[i] + 'T00:00:00Z');

    // Round to avoid float precision issues with daylight savings
    const diffTime = currDate - prevDate;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      currentStreak++;
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
      }
    } else if (diffDays > 1) {
      currentStreak = 1;
    }
  }

  return maxStreak;
}

/**
 * Checks all eligibility requirements for achievements and awards new ones.
 * @param {string} userId - ID of the logged in user
 * @returns {Promise<Array<object>>} Unlocked achievements
 */
export async function checkAndAwardAchievements(userId) {
  // Fetch currently unlocked achievement keys to avoid redundant checks/writes
  const existingAchievements = await Achievement.find({ user: userId }).select('key');
  const unlockedKeys = new Set(existingAchievements.map((a) => a.key));

  const newlyUnlocked = [];

  // 1. Gather all database records required for the checks
  const [
    habits,
    goals,
    reflections,
    focusSessions,
    gratitudes
  ] = await Promise.all([
    Habit.find({ user: userId }),
    Goal.find({ user: userId }),
    Reflection.find({ user: userId }),
    FocusSession.find({ user: userId }),
    Gratitude.find({ user: userId })
  ]);

  // Counts & filters
  const activeHabits = habits.filter((h) => h.isActive);
  const activeHabitsCount = activeHabits.length;
  const completedGoalsCount = goals.filter((g) => g.status === 'completed').length;
  
  const activeReflections = reflections.filter((r) => r.isActive);
  const activeReflectionsCount = activeReflections.length;
  
  const completedFocusSessions = focusSessions.filter((s) => s.isCompleted);
  const completedFocusSessionsCount = completedFocusSessions.length;
  
  const activeGratitudes = gratitudes.filter((g) => g.isActive);
  const activeGratitudesCount = activeGratitudes.length;

  // Streak values for habits
  const maxHabitStreak = habits.reduce((max, h) => Math.max(max, h.longestStreak || 0), 0);

  // Helper to award an achievement
  const award = async (key) => {
    if (unlockedKeys.has(key)) return;

    const def = ACHIEVEMENT_DEFINITIONS.find((d) => d.key === key);
    if (!def) return;

    // Create Achievement record
    const ach = await Achievement.create({
      user: userId,
      key: def.key,
      title: def.title,
      description: def.description,
      icon: def.icon,
      category: def.category,
    });

    // Create Notification record
    await Notification.create({
      user: userId,
      title: '🏆 Achievement Unlocked!',
      message: `You earned the "${def.title}" achievement: ${def.description}`,
      type: 'achievement',
      icon: def.icon,
      link: '/dashboard/achievements',
    });

    newlyUnlocked.push(ach);
    unlockedKeys.add(key);
  };

  // ─── HABITS ACHIEVEMENTS ───
  // first_habit: Created your first habit
  if (habits.length > 0) {
    await award('first_habit');
  }

  // habit_7_streak: Maintained a 7-day habit streak
  if (maxHabitStreak >= 7) {
    await award('habit_7_streak');
  }

  // habit_30_streak: Maintained a 30-day habit streak
  if (maxHabitStreak >= 30) {
    await award('habit_30_streak');
  }

  // habit_100_streak: Maintained a 100-day habit streak
  if (maxHabitStreak >= 100) {
    await award('habit_100_streak');
  }

  // five_habits: Created 5 or more habits (active)
  if (activeHabitsCount >= 5) {
    await award('five_habits');
  }

  // perfect_week: Completed all active habits for 7 days straight
  if (activeHabitsCount > 0) {
    // Map each habit's completedDates to YYYY-MM-DD
    const habitDateSets = activeHabits.map((h) => {
      const set = new Set();
      (h.completedDates || []).forEach((d) => {
        const dateObj = new Date(d);
        if (!isNaN(dateObj.getTime())) {
          const year = dateObj.getFullYear();
          const month = String(dateObj.getMonth() + 1).padStart(2, '0');
          const day = String(dateObj.getDate()).padStart(2, '0');
          set.add(`${year}-${month}-${day}`);
        }
      });
      return set;
    });

    // Find the dates when ALL active habits were completed
    const firstSet = habitDateSets[0];
    const perfectDays = [];
    for (const dateStr of firstSet) {
      if (habitDateSets.every((s) => s.has(dateStr))) {
        perfectDays.push(dateStr);
      }
    }

    const perfectStreak = getLongestStreak(perfectDays);
    if (perfectStreak >= 7) {
      await award('perfect_week');
    }
  }

  // ─── GOALS ACHIEVEMENTS ───
  // first_goal: Set your first goal
  if (goals.length > 0) {
    await award('first_goal');
  }

  // first_goal_done: Completed your first goal
  if (completedGoalsCount > 0) {
    await award('first_goal_done');
  }

  // five_goals_done: Completed 5 goals
  if (completedGoalsCount >= 5) {
    await award('five_goals_done');
  }

  // milestone_master: Completed 20 milestones across all goals
  let completedMilestonesCount = 0;
  goals.forEach((g) => {
    (g.milestones || []).forEach((m) => {
      if (m.isComplete) completedMilestonesCount++;
    });
  });
  if (completedMilestonesCount >= 20) {
    await award('milestone_master');
  }

  // ─── REFLECTION ACHIEVEMENTS ───
  // first_reflection: Wrote your first reflection
  if (activeReflectionsCount > 0) {
    await award('first_reflection');
  }

  // reflect_7_streak / reflect_30_streak
  if (activeReflectionsCount > 0) {
    const reflectionDates = activeReflections.map((r) => r.date);
    const longestReflectStreak = getLongestStreak(reflectionDates);
    if (longestReflectStreak >= 7) {
      await award('reflect_7_streak');
    }
    if (longestReflectStreak >= 30) {
      await award('reflect_30_streak');
    }
  }

  // reflect_100_days: Written 100 reflection entries
  if (activeReflectionsCount >= 100) {
    await award('reflect_100_days');
  }

  // ─── FOCUS ACHIEVEMENTS ───
  // first_focus: Completed your first focus session
  if (completedFocusSessionsCount > 0) {
    await award('first_focus');
  }

  // Accumulate focus time (only of type 'focus')
  const totalFocusMinutes = completedFocusSessions
    .filter((s) => s.type === 'focus')
    .reduce((sum, s) => sum + (s.duration || 0), 0);
  const totalFocusHours = totalFocusMinutes / 60;

  // focus_10_hours: Accumulated 10 hours
  if (totalFocusHours >= 10) {
    await award('focus_10_hours');
  }
  // focus_50_hours: Accumulated 50 hours
  if (totalFocusHours >= 50) {
    await award('focus_50_hours');
  }
  // focus_100_hours: Accumulated 100 hours
  if (totalFocusHours >= 100) {
    await award('focus_100_hours');
  }

  // focus_7_streak: Focused for 7 consecutive days
  if (completedFocusSessionsCount > 0) {
    const focusDates = completedFocusSessions
      .filter((s) => s.type === 'focus')
      .map((s) => s.completedAt || s.createdAt);
    const longestFocusStreak = getLongestStreak(focusDates);
    if (longestFocusStreak >= 7) {
      await award('focus_7_streak');
    }
  }

  // ─── GRATITUDE ACHIEVEMENTS ───
  // first_gratitude: Wrote your first gratitude entry
  if (activeGratitudesCount > 0) {
    await award('first_gratitude');
  }

  // grateful_7_streak / grateful_30_streak
  if (activeGratitudesCount > 0) {
    const gratitudeDates = activeGratitudes.map((g) => g.date || g.createdAt);
    const longestGratStreak = getLongestStreak(gratitudeDates);
    if (longestGratStreak >= 7) {
      await award('grateful_7_streak');
    }
    if (longestGratStreak >= 30) {
      await award('grateful_30_streak');
    }
  }

  // hundred_items: Recorded 100 things to be grateful for
  let gratitudeItemsCount = 0;
  activeGratitudes.forEach((g) => {
    gratitudeItemsCount += (g.entries || []).length;
  });
  if (gratitudeItemsCount >= 100) {
    await award('hundred_items');
  }

  // ─── GENERAL ACHIEVEMENTS ───
  // all_features: Used all 5 features at least once
  const usedHabits = habits.length > 0;
  const usedGoals = goals.length > 0;
  const usedReflections = activeReflectionsCount > 0;
  const usedFocus = completedFocusSessionsCount > 0;
  const usedGratitude = activeGratitudesCount > 0;

  if (usedHabits && usedGoals && usedReflections && usedFocus && usedGratitude) {
    await award('all_features');
  }

  // Collect all unique activity dates across all 5 features for dashboard active streaks
  const activityDates = [];
  
  // Habits completions
  habits.forEach((h) => {
    (h.completedDates || []).forEach((d) => activityDates.push(d));
  });
  // Goals creations / updates
  goals.forEach((g) => {
    activityDates.push(g.createdAt);
    activityDates.push(g.updatedAt);
  });
  // Reflections
  activeReflections.forEach((r) => activityDates.push(r.date));
  // Focus
  completedFocusSessions.forEach((s) => activityDates.push(s.completedAt || s.createdAt));
  // Gratitude
  activeGratitudes.forEach((g) => activityDates.push(g.date || g.createdAt));

  const longestActiveStreak = getLongestStreak(activityDates);

  // seven_day_active: Active on dashboard for 7 days straight
  if (longestActiveStreak >= 7) {
    await award('seven_day_active');
  }

  // thirty_day_active: Active on dashboard for 30 days straight
  if (longestActiveStreak >= 30) {
    await award('thirty_day_active');
  }

  return newlyUnlocked;
}
