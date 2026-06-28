/**
 * models/Goal.js — Mongoose Goal schema & model
 */

import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema({
  /** Title / Task description of the milestone */
  title: {
    type: String,
    required: [true, 'Milestone title is required'],
    trim: true,
  },

  /** Completion state */
  isComplete: {
    type: Boolean,
    default: false,
  },

  /** When the milestone was marked completed */
  completedAt: {
    type: Date,
    default: null,
  },
});

const goalSchema = new mongoose.Schema(
  {
    /** The user who owns this goal */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Goal owner is required'],
    },

    /** Title of the goal */
    title: {
      type: String,
      required: [true, 'Goal title is required'],
      trim: true,
    },

    /** Description of the goal */
    description: {
      type: String,
      default: '',
    },

    /** Category group */
    category: {
      type: String,
      enum: ['health', 'career', 'education', 'finance', 'personal', 'other'],
      default: 'personal',
    },

    /** Priority indicator */
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },

    /** Status of the goal */
    status: {
      type: String,
      enum: ['active', 'completed', 'abandoned'],
      default: 'active',
    },

    /** Target completion date */
    deadline: {
      type: Date,
      required: [true, 'Goal deadline is required'],
    },

    /** Progress percent (0 - 100) */
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    /** Nested tasks / milestones required to reach the goal */
    milestones: [milestoneSchema],

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

const Goal = mongoose.models.Goal || mongoose.model('Goal', goalSchema);

export default Goal;
