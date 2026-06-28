/**
 * controllers/focusController.js — Focus Timer business logic
 */

import FocusSession from '../models/FocusSession.js';
import FocusSettings from '../models/FocusSettings.js';

// ─── Helper Functions ─────────────────────────────────────────────────────────

/**
 * Returns Sunday at 00:00:00 local time for the current week
 * @returns {Date}
 */
const getStartOfWeek = () => {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day; // Sunday is index 0
  const sunday = new Date(d.setDate(diff));
  sunday.setHours(0, 0, 0, 0);
  return sunday;
};

/**
 * Returns the first day of the current month at 00:00:00 local time
 * @returns {Date}
 */
const getStartOfMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
};

/**
 * Formats a Date object into YYYY-MM-DD local time string
 * @param {Date|string} dateVal 
 * @returns {string}
 */
const getLocalYYYYMMDD = (dateVal) => {
  const d = new Date(dateVal);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Calculates current and longest session streaks of consecutive daily focus timers
 * @param {Date[]} datesList 
 * @returns {{ current: number, longest: number }}
 */
const calculateFocusStreaks = (datesList) => {
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

  // 1. Calculate longest streak ever
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

  // Helper check
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
    // Streak is broken
    return { current: 0, longest };
  }

  let current = 0;
  const checkDate = new Date(currentCheckTime);

  while (includesDate(checkDate)) {
    current++;
    checkDate.setDate(checkDate.getDate() - 1);
    checkDate.setHours(0, 0, 0, 0); // re-normalize
  }

  return { current, longest };
};

// ─── Controller Handlers ──────────────────────────────────────────────────────

/**
 * @desc   Get all focus sessions for the logged-in user
 * @route  GET /api/focus/sessions
 * @access Private
 * @query  ?date=YYYY-MM-DD&type=focus
 */
export const getSessions = async (req, res, next) => {
  const { date, type } = req.query;

  try {
    const query = { user: req.user._id };

    if (date) {
      const searchDate = new Date(date);
      if (!isNaN(searchDate.getTime())) {
        const startOfDay = new Date(searchDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(searchDate);
        endOfDay.setHours(23, 59, 59, 999);
        query.completedAt = {
          $gte: startOfDay,
          $lte: endOfDay,
        };
      }
    }

    if (type) {
      query.type = type;
    }

    const sessions = await FocusSession.find(query).sort({ completedAt: -1 });
    return res.status(200).json(sessions);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Log a completed focus session
 * @route  POST /api/focus/sessions
 * @access Private
 */
export const createSession = async (req, res, next) => {
  const { type, duration, label, notes, isCompleted } = req.body;

  try {
    if (duration === undefined || typeof duration !== 'number') {
      return res.status(400).json({ message: 'Session duration in minutes is required' });
    }

    const session = await FocusSession.create({
      user: req.user._id,
      type: type || 'focus',
      duration,
      label: label || '',
      notes: notes || '',
      isCompleted: isCompleted !== undefined ? isCompleted : true,
      completedAt: new Date(),
    });

    return res.status(201).json(session);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Permanently delete a focus session
 * @route  DELETE /api/focus/sessions/:id
 * @access Private
 */
export const deleteSession = async (req, res, next) => {
  const { id } = req.params;

  try {
    const session = await FocusSession.findOneAndDelete({ _id: id, user: req.user._id });
    if (!session) {
      return res.status(404).json({ message: 'Focus session not found or unauthorized' });
    }

    return res.status(200).json({ message: 'Session deleted' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get focus statistics for logged-in user
 * @route  GET /api/focus/stats
 * @access Private
 */
export const getFocusStats = async (req, res, next) => {
  try {
    // Only aggregate sessions where type = 'focus' and it was completed
    const sessions = await FocusSession.find({
      user: req.user._id,
      type: 'focus',
      isCompleted: true,
    });

    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const averageSessionLength =
      totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;

    // Filters for today, week, month
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfWeek = getStartOfWeek();
    const startOfMonth = getStartOfMonth();

    const todayMinutes = sessions
      .filter((s) => new Date(s.completedAt) >= today)
      .reduce((sum, s) => sum + (s.duration || 0), 0);

    const weekMinutes = sessions
      .filter((s) => new Date(s.completedAt) >= startOfWeek)
      .reduce((sum, s) => sum + (s.duration || 0), 0);

    const monthMinutes = sessions
      .filter((s) => new Date(s.completedAt) >= startOfMonth)
      .reduce((sum, s) => sum + (s.duration || 0), 0);

    // Calculate streaks
    const completedDates = sessions.map((s) => s.completedAt);
    const { current: currentStreak, longest: longestStreak } =
      calculateFocusStreaks(completedDates);

    // Calculate last 7 days breakdown
    const dailyBreakdown = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = getLocalYYYYMMDD(date);
      dailyBreakdown.push({ date: dateStr, minutes: 0 });
    }

    // Populate breakdown
    sessions.forEach((s) => {
      const sessionDateStr = getLocalYYYYMMDD(s.completedAt);
      const dayBucket = dailyBreakdown.find((b) => b.date === sessionDateStr);
      if (dayBucket) {
        dayBucket.minutes += s.duration || 0;
      }
    });

    return res.status(200).json({
      todayMinutes,
      weekMinutes,
      monthMinutes,
      totalSessions,
      totalMinutes,
      averageSessionLength,
      currentStreak,
      longestStreak,
      dailyBreakdown,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get focus timer settings for logged-in user (returns default if not found)
 * @route  GET /api/focus/settings
 * @access Private
 */
export const getSettings = async (req, res, next) => {
  try {
    let settings = await FocusSettings.findOne({ user: req.user._id });

    if (!settings) {
      // Return defaults as specified
      return res.status(200).json({
        focusDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        sessionsBeforeLongBreak: 4,
        autoStartBreaks: false,
        autoStartFocus: false,
      });
    }

    return res.status(200).json(settings);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Update/upsert focus timer settings
 * @route  PUT /api/focus/settings
 * @access Private
 */
export const updateSettings = async (req, res, next) => {
  const {
    focusDuration,
    shortBreakDuration,
    longBreakDuration,
    sessionsBeforeLongBreak,
    autoStartBreaks,
    autoStartFocus,
  } = req.body;

  try {
    const settings = await FocusSettings.findOneAndUpdate(
      { user: req.user._id },
      {
        focusDuration,
        shortBreakDuration,
        longBreakDuration,
        sessionsBeforeLongBreak,
        autoStartBreaks,
        autoStartFocus,
      },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json(settings);
  } catch (error) {
    next(error);
  }
};
