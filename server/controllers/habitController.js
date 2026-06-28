/**
 * controllers/habitController.js — Habit Tracker business logic
 */

import Habit from '../models/Habit.js';

// ─── Helper Functions ─────────────────────────────────────────────────────────

/**
 * Checks if two dates fall on the same day in local time.
 * @param {Date|string} d1 
 * @param {Date|string} d2 
 * @returns {boolean}
 */
const isSameDay = (d1, d2) => {
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * Calculates the current completion streak of consecutive days ending today/yesterday.
 * @param {Date[]} completedDates 
 * @returns {number}
 */
const calculateStreak = (completedDates) => {
  if (!completedDates || completedDates.length === 0) return 0;

  // Normalize dates to midnight local time and extract timestamps
  const uniqueTimestamps = Array.from(
    new Set(
      completedDates.map((d) => {
        const date = new Date(d);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
    )
  ).sort((a, b) => b - a); // Descending order: newest first

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTime = today.getTime();

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  const yesterdayTime = yesterday.getTime();

  // Determine the starting point of our check
  let currentCheckTime = null;
  if (uniqueTimestamps.includes(todayTime)) {
    currentCheckTime = todayTime;
  } else if (uniqueTimestamps.includes(yesterdayTime)) {
    currentCheckTime = yesterdayTime;
  } else {
    // Neither today nor yesterday was completed; streak is broken
    return 0;
  }

  let streakCount = 0;
  const checkDate = new Date(currentCheckTime);

  // Count consecutive days going backwards
  while (uniqueTimestamps.includes(checkDate.getTime())) {
    streakCount++;
    checkDate.setDate(checkDate.getDate() - 1);
    checkDate.setHours(0, 0, 0, 0); // Re-normalize for DST safety
  }

  return streakCount;
};

// ─── Controller Handlers ──────────────────────────────────────────────────────

/**
 * @desc   Get all active habits for the logged-in user
 * @route  GET /api/habits
 * @access Private
 */
export const getHabits = async (req, res, next) => {
  try {
    const habits = await Habit.find({ user: req.user._id, isActive: true });
    return res.status(200).json(habits);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Create a new habit
 * @route  POST /api/habits
 * @access Private
 */
export const createHabit = async (req, res, next) => {
  const { name, description, icon, frequency } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ message: 'Habit name is required' });
    }

    const habit = await Habit.create({
      user: req.user._id,
      name,
      description: description || '',
      icon: icon || '✅',
      frequency: frequency || 'daily',
    });

    return res.status(201).json(habit);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Update a habit by ID
 * @route  PUT /api/habits/:id
 * @access Private
 */
export const updateHabit = async (req, res, next) => {
  const { id } = req.params;
  const { name, description, icon, frequency } = req.body;

  try {
    const habit = await Habit.findOne({ _id: id, user: req.user._id, isActive: true });
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found or unauthorized' });
    }

    if (name !== undefined) habit.name = name;
    if (description !== undefined) habit.description = description;
    if (icon !== undefined) habit.icon = icon;
    if (frequency !== undefined) habit.frequency = frequency;

    const updatedHabit = await habit.save();
    return res.status(200).json(updatedHabit);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Soft delete a habit by ID (sets isActive to false)
 * @route  DELETE /api/habits/:id
 * @access Private
 */
export const deleteHabit = async (req, res, next) => {
  const { id } = req.params;

  try {
    const habit = await Habit.findOne({ _id: id, user: req.user._id, isActive: true });
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found or unauthorized' });
    }

    habit.isActive = false;
    await habit.save();

    return res.status(200).json({ message: 'Habit deleted' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Toggle completion for today's date and recalculate streak
 * @route  PATCH /api/habits/:id/toggle
 * @access Private
 */
export const toggleHabitComplete = async (req, res, next) => {
  const { id } = req.params;

  try {
    const habit = await Habit.findOne({ _id: id, user: req.user._id, isActive: true });
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found or unauthorized' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingIndex = habit.completedDates.findIndex((date) =>
      isSameDay(date, today)
    );

    if (existingIndex !== -1) {
      // Already completed today: Toggle OFF (remove date)
      habit.completedDates.splice(existingIndex, 1);
    } else {
      // Not completed today: Toggle ON (add date)
      habit.completedDates.push(today);
    }

    // Keep completedDates sorted ascending
    habit.completedDates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    // Recalculate streak
    const currentStreak = calculateStreak(habit.completedDates);
    habit.streak = currentStreak;

    // Update longestStreak if current exceeds it
    if (currentStreak > habit.longestStreak) {
      habit.longestStreak = currentStreak;
    }

    const updatedHabit = await habit.save();
    return res.status(200).json(updatedHabit);
  } catch (error) {
    next(error);
  }
};
