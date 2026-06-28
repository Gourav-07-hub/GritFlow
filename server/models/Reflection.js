/**
 * models/Reflection.js — Mongoose Reflection Journal schema & model
 */

import mongoose from 'mongoose';

const reflectionSchema = new mongoose.Schema(
  {
    /** The user who owns this reflection */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User owner is required'],
    },

    /** The date of this reflection entry */
    date: {
      type: Date,
      required: [true, 'Reflection date is required'],
      default: Date.now,
    },

    /** Mood rating (1 = Terrible, 5 = Amazing) */
    mood: {
      type: Number,
      required: [true, 'Mood score is required'],
      min: [1, 'Mood score must be at least 1'],
      max: [5, 'Mood score cannot exceed 5'],
    },

    /** Matching mood text label */
    moodLabel: {
      type: String,
      enum: ['Terrible', 'Bad', 'Okay', 'Good', 'Amazing'],
      required: [true, 'Mood label is required'],
    },

    /** "What did I learn today?" */
    learned: {
      type: String,
      default: '',
    },

    /** "What am I grateful for?" */
    grateful: {
      type: String,
      default: '',
    },

    /** "What can I improve tomorrow?" */
    improvements: {
      type: String,
      default: '',
    },

    /** "What was the best part of today?" */
    highlights: {
      type: String,
      default: '',
    },

    /** Array of user-defined tags (e.g. ['health', 'work']) */
    tags: {
      type: [String],
      default: [],
    },

    /** Soft delete support */
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Prevent duplicate entries for same user on same calendar day
// (To be strictly enforced by checking range in controller,
// but we can also use unique indexes if normalized. Range checking is safer
// for arbitrary timestamps).

const Reflection = mongoose.models.Reflection || mongoose.model('Reflection', reflectionSchema);

export default Reflection;
