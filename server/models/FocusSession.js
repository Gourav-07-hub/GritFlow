/**
 * models/FocusSession.js — Mongoose Focus Session schema & model
 */

import mongoose from 'mongoose';

const focusSessionSchema = new mongoose.Schema(
  {
    /** The user who completed this session */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User owner is required'],
    },

    /** The type of timer session */
    type: {
      type: String,
      enum: ['focus', 'short_break', 'long_break'],
      default: 'focus',
    },

    /** Duration in minutes */
    duration: {
      type: Number,
      required: [true, 'Duration in minutes is required'],
    },

    /** Completion timestamp */
    completedAt: {
      type: Date,
      default: Date.now,
    },

    /** Whether the timer was successfully completed or skipped */
    isCompleted: {
      type: Boolean,
      default: true,
    },

    /** Optional label for what task was focused on */
    label: {
      type: String,
      default: '',
    },

    /** Optional text notes recorded for the session */
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

const FocusSession =
  mongoose.models.FocusSession || mongoose.model('FocusSession', focusSessionSchema);

export default FocusSession;
