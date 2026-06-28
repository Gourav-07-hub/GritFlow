/**
 * controllers/gratitudeController.js — Gratitude Journal business logic
 */

import Gratitude from '../models/Gratitude.js';

// ─── Helper Functions ─────────────────────────────────────────────────────────

/**
 * Calculates current and longest consecutive daily streaks for gratitude entries
 * @param {Date[]} datesList 
 * @returns {{ current: number, longest: number }}
 */
const calculateGratitudeStreaks = (datesList) => {
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
 * @desc   Get all gratitude entries for logged in user (optional month and favorite filters)
 * @route  GET /api/gratitude
 * @access Private
 */
export const getGratitudeEntries = async (req, res, next) => {
  const { month, favorite } = req.query;

  try {
    const query = { user: req.user._id, isActive: true };

    if (month) {
      const [year, m] = month.split('-');
      const startOfMonth = new Date(parseInt(year), parseInt(m) - 1, 1);
      const endOfMonth = new Date(parseInt(year), parseInt(m), 0, 23, 59, 59, 999);
      query.date = {
        $gte: startOfMonth,
        $lte: endOfMonth,
      };
    }

    if (favorite === 'true') {
      query['entries.isFavorite'] = true;
    }

    const entries = await Gratitude.find(query).sort({ date: -1 });
    return res.status(200).json(entries);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get single gratitude entry by date
 * @route  GET /api/gratitude/date/:date
 * @access Private
 */
export const getGratitudeByDate = async (req, res, next) => {
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

    const entry = await Gratitude.findOne({
      user: req.user._id,
      isActive: true,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    if (!entry) {
      return res.status(404).json({ message: 'No gratitude entry found for this date' });
    }

    return res.status(200).json(entry);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Create new gratitude entry
 * @route  POST /api/gratitude
 * @access Private
 */
export const createGratitudeEntry = async (req, res, next) => {
  const { date, entries, mood, affirmation } = req.body;

  try {
    // Validate entries array exists and is not empty
    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ message: 'A gratitude entry must contain at least one item.' });
    }

    const searchDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(searchDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(searchDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Check if entry already exists for that calendar day
    const existingEntry = await Gratitude.findOne({
      user: req.user._id,
      isActive: true,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    if (existingEntry) {
      return res.status(400).json({ message: 'Gratitude entry already exists for this date' });
    }

    const newEntry = await Gratitude.create({
      user: req.user._id,
      date: searchDate,
      entries,
      mood: mood !== undefined ? mood : 3,
      affirmation: affirmation || '',
      isActive: true,
    });

    return res.status(201).json(newEntry);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Update gratitude entry by id
 * @route  PUT /api/gratitude/:id
 * @access Private
 */
export const updateGratitudeEntry = async (req, res, next) => {
  const { id } = req.params;
  const { entries, mood, affirmation } = req.body;

  try {
    const entry = await Gratitude.findOne({ _id: id, user: req.user._id, isActive: true });
    if (!entry) {
      return res.status(404).json({ message: 'Gratitude entry not found or unauthorized' });
    }

    if (entries !== undefined) {
      if (!Array.isArray(entries) || entries.length === 0) {
        return res.status(400).json({ message: 'A gratitude entry must contain at least one item.' });
      }
      entry.entries = entries;
    }

    if (mood !== undefined) entry.mood = mood;
    if (affirmation !== undefined) entry.affirmation = affirmation;

    await entry.save();
    return res.status(200).json(entry);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Soft delete gratitude entry by id
 * @route  DELETE /api/gratitude/:id
 * @access Private
 */
export const deleteGratitudeEntry = async (req, res, next) => {
  const { id } = req.params;

  try {
    const entry = await Gratitude.findOneAndUpdate(
      { _id: id, user: req.user._id, isActive: true },
      { isActive: false },
      { new: true }
    );

    if (!entry) {
      return res.status(404).json({ message: 'Gratitude entry not found or unauthorized' });
    }

    return res.status(200).json({ message: 'Gratitude entry deleted' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Toggle favorite flag on single item inside a gratitude entry
 * @route  PATCH /api/gratitude/:id/items/:itemId/favorite
 * @access Private
 */
export const toggleFavoriteItem = async (req, res, next) => {
  const { id, itemId } = req.params;

  try {
    const entry = await Gratitude.findOne({ _id: id, user: req.user._id, isActive: true });
    if (!entry) {
      return res.status(404).json({ message: 'Gratitude entry not found or unauthorized' });
    }

    const item = entry.entries.id(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Gratitude item not found' });
    }

    item.isFavorite = !item.isFavorite;
    await entry.save();

    return res.status(200).json(entry);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get gratitude statistics for logged in user
 * @route  GET /api/gratitude/stats
 * @access Private
 */
export const getGratitudeStats = async (req, res, next) => {
  try {
    const entriesList = await Gratitude.find({ user: req.user._id, isActive: true });

    const totalEntries = entriesList.length;
    const totalItems = entriesList.reduce((sum, entry) => sum + entry.entries.length, 0);
    const favoriteCount = entriesList.reduce((sum, entry) => sum + entry.entries.filter(i => i.isFavorite).length, 0);

    const averageMood = totalEntries > 0
      ? Math.round((entriesList.reduce((sum, entry) => sum + entry.mood, 0) / totalEntries) * 10) / 10
      : 0;

    // Category breakdown counter
    const categoryBreakdown = {
      people: 0,
      health: 0,
      work: 0,
      nature: 0,
      personal: 0,
      other: 0,
    };

    entriesList.forEach((entry) => {
      entry.entries.forEach((item) => {
        const cat = item.category || 'other';
        if (categoryBreakdown[cat] !== undefined) {
          categoryBreakdown[cat]++;
        } else {
          categoryBreakdown.other++;
        }
      });
    });

    // Most grateful day of the week
    const dayCounts = {
      Sunday: 0,
      Monday: 0,
      Tuesday: 0,
      Wednesday: 0,
      Thursday: 0,
      Friday: 0,
      Saturday: 0,
    };

    entriesList.forEach((entry) => {
      const dayIndex = new Date(entry.date).getDay();
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      dayCounts[days[dayIndex]]++;
    });

    let mostGratefulDay = 'None';
    let maxCount = 0;
    for (const [day, count] of Object.entries(dayCounts)) {
      if (count > maxCount) {
        maxCount = count;
        mostGratefulDay = day;
      }
    }

    if (totalEntries === 0) {
      mostGratefulDay = 'None';
    }

    // Streaks
    const datesList = entriesList.map((e) => e.date);
    const { current: currentStreak, longest: longestStreak } = calculateGratitudeStreaks(datesList);

    return res.status(200).json({
      totalEntries,
      totalItems,
      currentStreak,
      longestStreak,
      averageMood,
      favoriteCount,
      categoryBreakdown,
      mostGratefulDay,
    });
  } catch (error) {
    next(error);
  }
};
