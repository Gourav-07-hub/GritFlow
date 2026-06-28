/**
 * models/Habit.js — Mongoose Habit schema & model
 */

import mongoose from 'mongoose';

const habitSchema = new mongoose.Schema(
  {
    /** The user who owns this habit */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User owner is required'],
    },

    /** Name of the habit */
    name: {
      type: String,
      required: [true, 'Habit name is required'],
      trim: true,
    },

    /** Description of what the habit entails */
    description: {
      type: String,
      default: '',
    },

    /** Icon or emoji representing the habit */
    icon: {
      type: String,
      default: '✅',
    },

    /** How often the habit should be performed */
    frequency: {
      type: String,
      enum: ['daily', 'weekly'],
      default: 'daily',
    },

    /** Dates when this habit was marked completed */
    completedDates: {
      type: [Date],
      default: [],
    },

    /** Current streak of consecutive completions */
    streak: {
      type: Number,
      default: 0,
    },

    /** Longest streak achieved */
    longestStreak: {
      type: Number,
      default: 0,
    },

    /** For soft deleting habits */
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

const Habit = mongoose.models.Habit || mongoose.model('Habit', habitSchema);

export default Habit;
