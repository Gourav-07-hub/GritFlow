/**
 * models/Gratitude.js — Mongoose Gratitude Journal schema & model
 */

import mongoose from 'mongoose';

const gratitudeEntryItemSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Gratitude item text is required'],
    trim: true,
  },
  category: {
    type: String,
    enum: ['people', 'health', 'work', 'nature', 'personal', 'other'],
    default: 'other',
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
});

const gratitudeSchema = new mongoose.Schema(
  {
    /** Owner of the gratitude entry */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User owner is required'],
    },

    /** Date of this gratitude journal entry */
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },

    /** List of gratitude items logged for this day */
    entries: {
      type: [gratitudeEntryItemSchema],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'A gratitude entry must contain at least one item.',
      },
    },

    /** Mood score from 1 (Terrible) to 5 (Amazing) */
    mood: {
      type: Number,
      min: [1, 'Mood must be at least 1'],
      max: [5, 'Mood cannot be greater than 5'],
      default: 3,
    },

    /** Daily affirmation text */
    affirmation: {
      type: String,
      default: '',
    },

    /** Soft-delete flag */
    isActive: {
      type: Boolean,
      default: true,
    },

    /** Optional createdAt date */
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Gratitude = mongoose.models.Gratitude || mongoose.model('Gratitude', gratitudeSchema);

export default Gratitude;
