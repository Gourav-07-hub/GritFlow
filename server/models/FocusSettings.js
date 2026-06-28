/**
 * models/FocusSettings.js — Mongoose Focus Timer settings schema & model
 */

import mongoose from 'mongoose';

const focusSettingsSchema = new mongoose.Schema(
  {
    /** The user who owns these settings */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User owner is required'],
      unique: true, // One settings document per user
    },

    /** Focus session length in minutes */
    focusDuration: {
      type: Number,
      default: 25,
      min: [1, 'Focus duration must be at least 1 minute'],
    },

    /** Short break length in minutes */
    shortBreakDuration: {
      type: Number,
      default: 5,
      min: [1, 'Short break duration must be at least 1 minute'],
    },

    /** Long break length in minutes */
    longBreakDuration: {
      type: Number,
      default: 15,
      min: [1, 'Long break duration must be at least 1 minute'],
    },

    /** Focus sessions completed before triggering a long break */
    sessionsBeforeLongBreak: {
      type: Number,
      default: 4,
      min: [1, 'Must complete at least 1 focus session before break'],
    },

    /** Automatically start breaks when focus timer completes */
    autoStartBreaks: {
      type: Boolean,
      default: false,
    },

    /** Automatically start focus sessions when break timer completes */
    autoStartFocus: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const FocusSettings =
  mongoose.models.FocusSettings || mongoose.model('FocusSettings', focusSettingsSchema);

export default FocusSettings;
