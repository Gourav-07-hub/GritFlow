/**
 * models/UserPreferences.js — Mongoose User Preferences schema & model
 */

import mongoose from 'mongoose';

const userPreferencesSchema = new mongoose.Schema(
  {
    /** The user who owns these preferences */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User owner is required'],
      unique: true,
    },

    /** Theme selection */
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system',
    },

    /** Language code (e.g. 'en', 'es') */
    language: {
      type: String,
      default: 'en',
    },

    /** User timezone (e.g. 'UTC', 'America/New_York') */
    timezone: {
      type: String,
      default: 'UTC',
    },

    /** Notification settings */
    notifications: {
      dailyReminder: {
        type: Boolean,
        default: true,
      },
      reminderTime: {
        type: String,
        default: '09:00',
      },
      habitReminders: {
        type: Boolean,
        default: true,
      },
      goalDeadlines: {
        type: Boolean,
        default: true,
      },
      weeklyReport: {
        type: Boolean,
        default: true,
      },
    },

    /** Dashboard appearance settings */
    dashboard: {
      defaultView: {
        type: String,
        enum: ['overview', 'habits', 'goals', 'reflection', 'focus', 'gratitude'],
        default: 'overview',
      },
      showStreaks: {
        type: Boolean,
        default: true,
      },
      showMotivational: {
        type: Boolean,
        default: true,
      },
    },

    /** Privacy configurations */
    privacy: {
      shareStats: {
        type: Boolean,
        default: false,
      },
      publicProfile: {
        type: Boolean,
        default: false,
      },
    },

    /** Timestamps */
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

const UserPreferences =
  mongoose.models.UserPreferences || mongoose.model('UserPreferences', userPreferencesSchema);

export default UserPreferences;
