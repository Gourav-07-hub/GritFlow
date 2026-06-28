/**
 * controllers/statsController.js — Statistics Dashboard business logic
 */

import Habit from '../models/Habit.js';
import Goal from '../models/Goal.js';
import Reflection from '../models/Reflection.js';
import FocusSession from '../models/FocusSession.js';
import Gratitude from '../models/Gratitude.js';

// ─── Helper Functions ─────────────────────────────────────────────────────────

/**
 * Normalizes date to YYYY-MM-DD local time string representation
 */
const getLocalYYYYMMDD = (dateVal) => {
  const d = new Date(dateVal);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Checks if a given timestamp represents today in local calendar time
 */
const isToday = (dateVal) => {
  const d = new Date(dateVal);
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
};

/**
 * Calculates current and longest consecutive streaks of completions
 */
const calculateStreaks = (datesList) => {
  if (!datesList || datesList.length === 0) {
    return { current: 0, longest: 0 };
  }

  // Normalize dates to midnight local time and extract timestamps
  const sortedTimestamps = Array.from(
    new Set(
      datesList.map((d) => {
        const date = new Date(d);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
    )
  ).sort((a, b) => a - b); // Ascending order

  // 1. Calculate longest streak
  let longest = 0;
  let currentSegment = 0;
  let prevTime = null;

  for (const time of sortedTimestamps) {
    if (prevTime === null) {
      currentSegment = 1;
    } else {
      const d1 = new Date(prevTime);
      const d2 = new Date(time);

      // Increment d1 by 1 calendar day
      const d1PlusOne = new Date(d1);
      d1PlusOne.setDate(d1PlusOne.getDate() + 1);

      if (
        d1PlusOne.getFullYear() === d2.getFullYear() &&
        d1PlusOne.getMonth() === d2.getMonth() &&
        d1PlusOne.getDate() === d2.getDate()
      ) {
        currentSegment++;
      } else {
        if (currentSegment > longest) longest = currentSegment;
        currentSegment = 1;
      }
    }
    prevTime = time;
  }
  if (currentSegment > longest) longest = currentSegment;

  // 2. Calculate current streak ending today or yesterday
  const uniqueDescending = [...sortedTimestamps].sort((a, b) => b - a);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTime = today.getTime();

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  const yesterdayTime = yesterday.getTime();

  const includesDate = (dateObj) => {
    return uniqueDescending.some((t) => {
      const d = new Date(t);
      return (
        d.getFullYear() === dateObj.getFullYear() &&
        d.getMonth() === dateObj.getMonth() &&
        d.getDate() === dateObj.getDate()
      );
    });
  };

  let currentCheckTime = null;
  if (includesDate(today)) {
    currentCheckTime = todayTime;
  } else if (includesDate(yesterday)) {
    currentCheckTime = yesterdayTime;
  } else {
    return { current: 0, longest };
  }

  let current = 0;
  const checkDate = new Date(currentCheckTime);

  while (includesDate(checkDate)) {
    current++;
    checkDate.setDate(checkDate.getDate() - 1);
    checkDate.setHours(0, 0, 0, 0);
  }

  return { current, longest };
};

/**
 * Monday of current week (local calendar day)
 */
const getMondayOfCurrentWeek = () => {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

// ─── Controller Handlers ──────────────────────────────────────────────────────

/**
 * @desc   Get overview statistics across all features
 * @route  GET /api/stats/overview
 * @access Private
 */
export const getOverviewStats = async (req, res, next) => {
  const userId = req.user._id;

  try {
    // 1. Fetch data from all modules
    const [habits, goals, focusSessions, reflections, gratitudes] = await Promise.all([
      Habit.find({ user: userId, isActive: true }),
      Goal.find({ user: userId, isActive: true }),
      FocusSession.find({ user: userId, type: 'focus', isCompleted: true }),
      Reflection.find({ user: userId, isActive: true }),
      Gratitude.find({ user: userId, isActive: true }),
    ]);

    // Habits Overview
    const completedToday = habits.filter((h) =>
      h.completedDates.some((d) => isToday(d))
    ).length;
    const totalHabits = habits.length;
    const bestStreak = totalHabits > 0
      ? Math.max(...habits.map((h) => Math.max(h.streak || 0, h.longestStreak || 0)))
      : 0;
    const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

    // Goals Overview
    const activeGoals = goals.filter((g) => g.status === 'active');
    const totalGoals = activeGoals.length;
    const completedGoals = goals.filter((g) => g.status === 'completed').length;
    const overdueGoals = activeGoals.filter(
      (g) => g.deadline && new Date(g.deadline) < new Date()
    ).length;
    const averageProgress = totalGoals > 0
      ? Math.round(activeGoals.reduce((sum, g) => sum + (g.progress || 0), 0) / totalGoals)
      : 0;

    // Focus Timer Overview
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const monday = getMondayOfCurrentWeek();

    const todayMinutes = focusSessions
      .filter((s) => new Date(s.completedAt) >= startOfToday)
      .reduce((sum, s) => sum + (s.duration || 0), 0);

    const weekMinutes = focusSessions
      .filter((s) => new Date(s.completedAt) >= monday)
      .reduce((sum, s) => sum + (s.duration || 0), 0);

    const totalSessions = focusSessions.length;
    const focusStreak = calculateStreaks(focusSessions.map((s) => s.completedAt));

    // Reflections Overview
    const totalReflectionEntries = reflections.length;
    const reflectionStreak = calculateStreaks(reflections.map((r) => r.date));
    const averageMood = totalReflectionEntries > 0
      ? Math.round((reflections.reduce((sum, r) => sum + (r.mood || 0), 0) / totalReflectionEntries) * 10) / 10
      : 0;
    const sortedReflections = [...reflections].sort((a, b) => new Date(b.date) - new Date(a.date));
    const lastReflectionDate = sortedReflections.length > 0 ? sortedReflections[0].date : null;

    // Gratitude Overview
    const totalGratitudeEntries = gratitudes.length;
    const gratitudeStreak = calculateStreaks(gratitudes.map((g) => g.date));
    const totalItems = gratitudes.reduce((sum, g) => sum + (g.entries?.length || 0), 0);
    const sortedGratitudes = [...gratitudes].sort((a, b) => new Date(b.date) - new Date(a.date));
    const lastGratitudeDate = sortedGratitudes.length > 0 ? sortedGratitudes[0].date : null;

    return res.status(200).json({
      habits: {
        totalHabits,
        completedToday,
        bestStreak,
        completionRate,
      },
      goals: {
        totalGoals,
        completedGoals,
        overdueGoals,
        averageProgress,
      },
      focus: {
        todayMinutes,
        weekMinutes,
        totalSessions,
        currentStreak: focusStreak.current,
      },
      reflections: {
        totalEntries: totalReflectionEntries,
        currentStreak: reflectionStreak.current,
        averageMood,
        lastEntryDate: lastReflectionDate,
      },
      gratitude: {
        totalEntries: totalGratitudeEntries,
        currentStreak: gratitudeStreak.current,
        totalItems,
        lastEntryDate: lastGratitudeDate,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get activity heatmap score for the last 365 days
 * @route  GET /api/stats/heatmap
 * @access Private
 */
export const getActivityHeatmap = async (req, res, next) => {
  const userId = req.user._id;

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 364);
    startDate.setHours(0, 0, 0, 0);

    const [habits, focusSessions, reflections, gratitudes] = await Promise.all([
      Habit.find({ user: userId, isActive: true }),
      FocusSession.find({ user: userId, type: 'focus', isCompleted: true, completedAt: { $gte: startDate } }),
      Reflection.find({ user: userId, isActive: true, date: { $gte: startDate } }),
      Gratitude.find({ user: userId, isActive: true, date: { $gte: startDate } }),
    ]);

    // Map completions to local dates Set
    const habitDates = new Set();
    habits.forEach((h) => {
      h.completedDates.forEach((d) => {
        if (new Date(d) >= startDate) {
          habitDates.add(getLocalYYYYMMDD(d));
        }
      });
    });

    const focusDates = new Set(focusSessions.map((s) => getLocalYYYYMMDD(s.completedAt)));
    const reflectionDates = new Set(reflections.map((r) => getLocalYYYYMMDD(r.date)));
    const gratitudeDates = new Set(gratitudes.map((g) => getLocalYYYYMMDD(g.date)));

    const heatmap = [];
    for (let i = 364; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const dateStr = getLocalYYYYMMDD(d);

      let score = 0;
      if (habitDates.has(dateStr)) score++;
      if (focusDates.has(dateStr)) score++;
      if (reflectionDates.has(dateStr)) score++;
      if (gratitudeDates.has(dateStr)) score++;

      heatmap.push({
        date: dateStr,
        score,
        level: score,
      });
    }

    return res.status(200).json(heatmap);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get weekly progress summary report (Monday to Sunday)
 * @route  GET /api/stats/weekly
 * @access Private
 */
export const getWeeklyReport = async (req, res, next) => {
  const userId = req.user._id;

  try {
    const monday = getMondayOfCurrentWeek();
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const startTime = monday.getTime();
    const endTime = sunday.getTime();

    // 1. Fetch relevant user models
    const [habitsList, focusSessions, reflections, gratitudes, goalsList] = await Promise.all([
      Habit.find({ user: userId, isActive: true }),
      FocusSession.find({ user: userId, type: 'focus', isCompleted: true, completedAt: { $gte: monday, $lte: sunday } }),
      Reflection.find({ user: userId, isActive: true, date: { $gte: monday, $lte: sunday } }),
      Gratitude.find({ user: userId, isActive: true, date: { $gte: monday, $lte: sunday } }),
      Goal.find({ user: userId, isActive: true }),
    ]);

    // Setup 7-day array starting on Monday
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });

    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    // 2. Habits Report
    const completionsPerDay = weekDays.map((day) => {
      const dayStr = getLocalYYYYMMDD(day);
      let count = 0;
      habitsList.forEach((h) => {
        h.completedDates.forEach((d) => {
          if (getLocalYYYYMMDD(d) === dayStr) {
            count++;
          }
        });
      });
      return count;
    });

    let mostConsistentHabit = 'None';
    let maxCompletions = 0;
    habitsList.forEach((h) => {
      const weekCompletions = h.completedDates.filter((d) => {
        const t = new Date(d).getTime();
        return t >= startTime && t <= endTime;
      }).length;

      if (weekCompletions > maxCompletions) {
        maxCompletions = weekCompletions;
        mostConsistentHabit = h.name;
      }
    });

    // 3. Focus Report
    const minutesPerDay = weekDays.map((day) => {
      const dayStr = getLocalYYYYMMDD(day);
      return focusSessions
        .filter((s) => getLocalYYYYMMDD(s.completedAt) === dayStr)
        .reduce((sum, s) => sum + (s.duration || 0), 0);
    });

    const totalWeekMinutes = minutesPerDay.reduce((sum, m) => sum + m, 0);

    let bestFocusDay = 'None';
    let maxMinutes = 0;
    minutesPerDay.forEach((mins, idx) => {
      if (mins > maxMinutes) {
        maxMinutes = mins;
        bestFocusDay = dayNames[idx];
      }
    });
    if (totalWeekMinutes === 0) {
      bestFocusDay = 'None';
    }

    // 4. Reflections Report
    const entriesThisWeekRef = reflections.length;
    const averageMoodThisWeek = entriesThisWeekRef > 0
      ? Math.round((reflections.reduce((sum, r) => sum + r.mood, 0) / entriesThisWeekRef) * 10) / 10
      : 0;

    // 5. Gratitude Report
    const entriesThisWeekGrat = gratitudes.length;
    const totalItemsThisWeek = gratitudes.reduce((sum, g) => sum + (g.entries?.length || 0), 0);

    // 6. Goals Report
    const milestonesCompletedThisWeek = goalsList.reduce((sum, goal) => {
      const count = goal.milestones.filter((m) => {
        if (!m.isComplete || !m.completedAt) return false;
        const t = new Date(m.completedAt).getTime();
        return t >= startTime && t <= endTime;
      }).length;
      return sum + count;
    }, 0);

    const goalsCompletedThisWeek = goalsList.filter((g) => {
      if (g.status !== 'completed') return false;
      const t = new Date(g.updatedAt).getTime();
      return t >= startTime && t <= endTime;
    }).length;

    return res.status(200).json({
      weekRange: {
        startDate: monday,
        endDate: sunday,
      },
      habits: {
        completionsPerDay,
        mostConsistentHabit,
      },
      focus: {
        minutesPerDay,
        totalWeekMinutes,
        bestFocusDay,
      },
      reflections: {
        entriesThisWeek: entriesThisWeekRef,
        averageMoodThisWeek,
      },
      gratitude: {
        entriesThisWeek: entriesThisWeekGrat,
        totalItemsThisWeek,
      },
      goals: {
        milestonesCompletedThisWeek,
        goalsCompletedThisWeek,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get monthly progress summary report
 * @route  GET /api/stats/monthly
 * @access Private
 * @query  ?month=YYYY-MM
 */
export const getMonthlyReport = async (req, res, next) => {
  const userId = req.user._id;
  const { month } = req.query;

  try {
    let yearNum, monthNum;
    if (month) {
      const parts = month.split('-');
      yearNum = parseInt(parts[0]);
      monthNum = parseInt(parts[1]);
    } else {
      const d = new Date();
      yearNum = d.getFullYear();
      monthNum = d.getMonth() + 1;
    }

    const startOfMonth = new Date(yearNum, monthNum - 1, 1);
    const endOfMonth = new Date(yearNum, monthNum, 0, 23, 59, 59, 999);
    const totalDays = endOfMonth.getDate();

    const startTime = startOfMonth.getTime();
    const endTime = endOfMonth.getTime();

    // 1. Fetch data
    const [habitsList, focusSessions, reflections, gratitudes, goalsList] = await Promise.all([
      Habit.find({ user: userId, isActive: true }),
      FocusSession.find({ user: userId, type: 'focus', isCompleted: true, completedAt: { $gte: startOfMonth, $lte: endOfMonth } }),
      Reflection.find({ user: userId, isActive: true, date: { $gte: startOfMonth, $lte: endOfMonth } }),
      Gratitude.find({ user: userId, isActive: true, date: { $gte: startOfMonth, $lte: endOfMonth } }),
      Goal.find({ user: userId, isActive: true }),
    ]);

    // 2. Habits Monthly stats
    let totalCompletions = 0;
    let bestHabit = 'None';
    let maxCompletions = 0;

    habitsList.forEach((h) => {
      const count = h.completedDates.filter((d) => {
        const t = new Date(d).getTime();
        return t >= startTime && t <= endTime;
      }).length;

      totalCompletions += count;

      if (count > maxCompletions) {
        maxCompletions = count;
        bestHabit = h.name;
      }
    });

    const possibleCompletions = habitsList.reduce((sum, h) => {
      if (h.frequency === 'weekly') {
        return sum + Math.ceil(totalDays / 7);
      }
      return sum + totalDays;
    }, 0);

    const completionRate = possibleCompletions > 0
      ? Math.round((totalCompletions / possibleCompletions) * 100)
      : 0;

    // 3. Focus Monthly stats
    const totalMinutes = focusSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const totalSessions = focusSessions.length;
    const averageDailyMinutes = totalDays > 0 ? Math.round((totalMinutes / totalDays) * 10) / 10 : 0;

    // 4. Reflections Monthly stats
    const totalReflectionEntries = reflections.length;
    const averageMood = totalReflectionEntries > 0
      ? Math.round((reflections.reduce((sum, r) => sum + r.mood, 0) / totalReflectionEntries) * 10) / 10
      : 0;

    // Daily mood trend YYYY-MM-DD
    const moodTrend = [];
    for (let day = 1; day <= totalDays; day++) {
      const d = new Date(yearNum, monthNum - 1, day);
      const dateStr = getLocalYYYYMMDD(d);
      const dayEntries = reflections.filter((r) => getLocalYYYYMMDD(r.date) === dateStr);
      const avgMood = dayEntries.length > 0
        ? Math.round((dayEntries.reduce((sum, r) => sum + r.mood, 0) / dayEntries.length) * 10) / 10
        : 0;
      moodTrend.push({ date: dateStr, mood: avgMood });
    }

    // 5. Gratitude Monthly stats
    const totalGratitudeEntries = gratitudes.length;
    const totalItems = gratitudes.reduce((sum, g) => sum + (g.entries?.length || 0), 0);

    const catsCount = {};
    gratitudes.forEach((g) => {
      g.entries.forEach((item) => {
        const cat = item.category || 'other';
        catsCount[cat] = (catsCount[cat] || 0) + 1;
      });
    });

    const topCategories = Object.entries(catsCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map((entry) => entry[0]);

    // 6. Goals Monthly stats
    const createdGoals = goalsList.filter((g) => {
      const t = new Date(g.createdAt).getTime();
      return t >= startTime && t <= endTime;
    }).length;

    const completedGoals = goalsList.filter((g) => {
      if (g.status !== 'completed') return false;
      const t = new Date(g.updatedAt).getTime();
      return t >= startTime && t <= endTime;
    }).length;

    const abandonedGoals = goalsList.filter((g) => {
      if (g.status !== 'abandoned') return false;
      const t = new Date(g.updatedAt).getTime();
      return t >= startTime && t <= endTime;
    }).length;

    return res.status(200).json({
      monthRange: {
        month: `${yearNum}-${String(monthNum).padStart(2, '0')}`,
        totalDays,
      },
      habits: {
        totalCompletions,
        completionRate,
        bestHabit,
      },
      focus: {
        totalMinutes,
        totalSessions,
        averageDailyMinutes,
      },
      reflections: {
        totalEntries: totalReflectionEntries,
        averageMood,
        moodTrend,
      },
      gratitude: {
        totalEntries: totalGratitudeEntries,
        totalItems,
        topCategories,
      },
      goals: {
        created: createdGoals,
        completed: completedGoals,
        abandoned: abandonedGoals,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get streak leaderboard for all logged in user features
 * @route  GET /api/stats/streaks
 * @access Private
 */
export const getStreakLeaderboard = async (req, res, next) => {
  const userId = req.user._id;

  try {
    const [habitsList, focusSessions, reflections, gratitudes] = await Promise.all([
      Habit.find({ user: userId, isActive: true }),
      FocusSession.find({ user: userId, type: 'focus', isCompleted: true }),
      Reflection.find({ user: userId, isActive: true }),
      Gratitude.find({ user: userId, isActive: true }),
    ]);

    // 1. Habit Tracker Streaks
    const habitStreaks = habitsList.map((h) => ({
      feature: 'Habit Tracker',
      name: h.name,
      currentStreak: h.streak || 0,
      longestStreak: h.longestStreak || 0,
      icon: h.icon || '✅',
    }));

    // 2. Reflection Journal Streaks
    const reflectionStreak = calculateStreaks(reflections.map((r) => r.date));
    const reflectionStreakEntry = {
      feature: 'Reflection Journal',
      name: 'Daily Reflection',
      currentStreak: reflectionStreak.current,
      longestStreak: reflectionStreak.longest,
      icon: '📓',
    };

    // 3. Gratitude Journal Streaks
    const gratitudeStreak = calculateStreaks(gratitudes.map((g) => g.date));
    const gratitudeStreakEntry = {
      feature: 'Gratitude Journal',
      name: 'Daily Gratitude',
      currentStreak: gratitudeStreak.current,
      longestStreak: gratitudeStreak.longest,
      icon: '🙏',
    };

    // 4. Focus Timer Streaks
    const focusStreak = calculateStreaks(focusSessions.map((s) => s.completedAt));
    const focusStreakEntry = {
      feature: 'Focus Timer',
      name: 'Daily Focus',
      currentStreak: focusStreak.current,
      longestStreak: focusStreak.longest,
      icon: '⏱️',
    };

    const leaderboard = [
      ...habitStreaks,
      reflectionStreakEntry,
      gratitudeStreakEntry,
      focusStreakEntry,
    ].sort((a, b) => b.currentStreak - a.currentStreak);

    return res.status(200).json(leaderboard);
  } catch (error) {
    next(error);
  }
};
