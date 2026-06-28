/**
 * controllers/reflectionController.js — Reflection Journal business logic
 */

import Reflection from '../models/Reflection.js';

// ─── Helper Functions ─────────────────────────────────────────────────────────

/**
 * Calculates current and longest completion streaks for reflection entries
 * @param {Date[]} datesList 
 * @returns {{ current: number, longest: number }}
 */
const calculateReflectionStreaks = (datesList) => {
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
 * @desc   Get all active reflections for the logged-in user, sorted by date descending
 * @route  GET /api/reflections
 * @access Private
 * @query  ?month=YYYY-MM
 */
export const getReflections = async (req, res, next) => {
  const { month } = req.query;

  try {
    const query = { user: req.user._id, isActive: true };

    if (month) {
      const [year, m] = month.split('-');
      const startOfMonth = new Date(parseInt(year), parseInt(m) - 1, 1);
      // Day 0 of next month is the last day of the current month
      const endOfMonth = new Date(parseInt(year), parseInt(m), 0, 23, 59, 59, 999);
      query.date = {
        $gte: startOfMonth,
        $lte: endOfMonth,
      };
    }

    const reflections = await Reflection.find(query).sort({ date: -1 });
    return res.status(200).json(reflections);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get a single reflection by date (YYYY-MM-DD)
 * @route  GET /api/reflections/date/:date
 * @access Private
 */
export const getReflectionByDate = async (req, res, next) => {
  const { date } = req.params;

  try {
    const searchDate = new Date(date);
    if (isNaN(searchDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date parameter' });
    }

    const startOfDay = new Date(searchDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(searchDate);
    endOfDay.setHours(23, 59, 59, 999);

    const reflection = await Reflection.findOne({
      user: req.user._id,
      isActive: true,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    if (!reflection) {
      return res.status(404).json({ message: 'No reflection found for this date' });
    }

    return res.status(200).json(reflection);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Create a new reflection entry
 * @route  POST /api/reflections
 * @access Private
 */
export const createReflection = async (req, res, next) => {
  const {
    date,
    mood,
    moodLabel,
    learned,
    grateful,
    improvements,
    highlights,
    tags,
  } = req.body;

  try {
    if (mood === undefined || !moodLabel) {
      return res.status(400).json({ message: 'Mood and mood label are required' });
    }

    const inputDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(inputDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(inputDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Reject duplicate entries for the same calendar day
    const existing = await Reflection.findOne({
      user: req.user._id,
      isActive: true,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    if (existing) {
      return res.status(400).json({ message: 'Reflection already exists for this date' });
    }

    const reflection = await Reflection.create({
      user: req.user._id,
      date: inputDate,
      mood,
      moodLabel,
      learned: learned || '',
      grateful: grateful || '',
      improvements: improvements || '',
      highlights: highlights || '',
      tags: tags || [],
    });

    return res.status(201).json(reflection);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Update a reflection by ID
 * @route  PUT /api/reflections/:id
 * @access Private
 */
export const updateReflection = async (req, res, next) => {
  const { id } = req.params;
  const {
    mood,
    moodLabel,
    learned,
    grateful,
    improvements,
    highlights,
    tags,
  } = req.body;

  try {
    const reflection = await Reflection.findOne({ _id: id, user: req.user._id, isActive: true });
    if (!reflection) {
      return res.status(404).json({ message: 'Reflection not found or unauthorized' });
    }

    if (mood !== undefined) reflection.mood = mood;
    if (moodLabel !== undefined) reflection.moodLabel = moodLabel;
    if (learned !== undefined) reflection.learned = learned;
    if (grateful !== undefined) reflection.grateful = grateful;
    if (improvements !== undefined) reflection.improvements = improvements;
    if (highlights !== undefined) reflection.highlights = highlights;
    if (tags !== undefined) reflection.tags = tags;

    const updated = await reflection.save();
    return res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Soft delete a reflection by ID
 * @route  DELETE /api/reflections/:id
 * @access Private
 */
export const deleteReflection = async (req, res, next) => {
  const { id } = req.params;

  try {
    const reflection = await Reflection.findOne({ _id: id, user: req.user._id, isActive: true });
    if (!reflection) {
      return res.status(404).json({ message: 'Reflection not found or unauthorized' });
    }

    reflection.isActive = false;
    await reflection.save();

    return res.status(200).json({ message: 'Reflection deleted' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get reflection statistics
 * @route  GET /api/reflections/stats
 * @access Private
 */
export const getReflectionStats = async (req, res, next) => {
  try {
    const reflections = await Reflection.find({ user: req.user._id, isActive: true });

    const totalEntries = reflections.length;

    // Calculate Average Mood
    let averageMood = 0;
    if (totalEntries > 0) {
      const sumMood = reflections.reduce((sum, r) => sum + r.mood, 0);
      averageMood = parseFloat((sumMood / totalEntries).toFixed(1));
    }

    // Calculate Streaks
    const entryDates = reflections.map((r) => r.date);
    const { current: currentStreak, longest: longestStreak } = calculateReflectionStreaks(entryDates);

    // Calculate Mood Distribution
    const moodDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reflections.forEach((r) => {
      if (r.mood >= 1 && r.mood <= 5) {
        moodDistribution[r.mood]++;
      }
    });

    // Calculate Most Used Tags
    const tagCounts = {};
    reflections.forEach((r) => {
      if (r.tags && Array.isArray(r.tags)) {
        r.tags.forEach((tag) => {
          const trimmed = tag.trim();
          if (trimmed) {
            tagCounts[trimmed] = (tagCounts[trimmed] || 0) + 1;
          }
        });
      }
    });

    const mostUsedTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1]) // Sort by frequency count descending
      .slice(0, 5)
      .map((entry) => entry[0]);

    return res.status(200).json({
      totalEntries,
      averageMood,
      currentStreak,
      longestStreak,
      moodDistribution,
      mostUsedTags,
    });
  } catch (error) {
    next(error);
  }
};
