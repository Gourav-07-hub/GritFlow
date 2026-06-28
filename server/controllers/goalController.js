/**
 * controllers/goalController.js — Goal Setting business logic
 */

import Goal from '../models/Goal.js';

/**
 * @desc   Get all active goals for the logged-in user sorted by deadline ascending
 * @route  GET /api/goals
 * @access Private
 */
export const getGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ user: req.user._id, isActive: true }).sort({
      deadline: 1,
    });
    return res.status(200).json(goals);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Create a new goal
 * @route  POST /api/goals
 * @access Private
 */
export const createGoal = async (req, res, next) => {
  const { title, description, category, priority, deadline, milestones } = req.body;

  try {
    if (!title || !deadline) {
      return res.status(400).json({ message: 'Title and deadline are required' });
    }

    const goal = await Goal.create({
      user: req.user._id,
      title,
      description: description || '',
      category: category || 'personal',
      priority: priority || 'medium',
      deadline,
      milestones: milestones || [],
    });

    return res.status(201).json(goal);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Update a goal by ID
 * @route  PUT /api/goals/:id
 * @access Private
 */
export const updateGoal = async (req, res, next) => {
  const { id } = req.params;
  const { title, description, category, priority, deadline, status } = req.body;

  try {
    const goal = await Goal.findOne({ _id: id, user: req.user._id, isActive: true });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found or unauthorized' });
    }

    if (title !== undefined) goal.title = title;
    if (description !== undefined) goal.description = description;
    if (category !== undefined) goal.category = category;
    if (priority !== undefined) goal.priority = priority;
    if (deadline !== undefined) goal.deadline = deadline;
    
    if (status !== undefined) {
      goal.status = status;
      // Consistent sync: If status is set to completed manually, force progress to 100
      if (status === 'completed') {
        goal.progress = 100;
        // Optionally mark all milestones as complete
        goal.milestones.forEach((m) => {
          if (!m.isComplete) {
            m.isComplete = true;
            m.completedAt = new Date();
          }
        });
      } else if (status === 'active' && goal.progress === 100) {
        // If status is changed back to active, pull progress back below 100
        goal.progress = 99;
      }
    }

    const updatedGoal = await goal.save();
    return res.status(200).json(updatedGoal);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Soft delete a goal by ID (sets isActive to false)
 * @route  DELETE /api/goals/:id
 * @access Private
 */
export const deleteGoal = async (req, res, next) => {
  const { id } = req.params;

  try {
    const goal = await Goal.findOne({ _id: id, user: req.user._id, isActive: true });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found or unauthorized' });
    }

    goal.isActive = false;
    await goal.save();

    return res.status(200).json({ message: 'Goal deleted' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Update goal completion progress percentage manually
 * @route  PATCH /api/goals/:id/progress
 * @access Private
 */
export const updateGoalProgress = async (req, res, next) => {
  const { id } = req.params;
  const { progress } = req.body;

  try {
    if (progress === undefined || typeof progress !== 'number' || progress < 0 || progress > 100) {
      return res.status(400).json({ message: 'Valid progress percentage (0-100) is required' });
    }

    const goal = await Goal.findOne({ _id: id, user: req.user._id, isActive: true });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found or unauthorized' });
    }

    goal.progress = progress;

    if (progress === 100) {
      goal.status = 'completed';
      // Mark all milestones as complete if progress hits 100%
      goal.milestones.forEach((m) => {
        if (!m.isComplete) {
          m.isComplete = true;
          m.completedAt = new Date();
        }
      });
    } else if (progress < 100 && goal.status === 'completed') {
      goal.status = 'active';
    }

    const updatedGoal = await goal.save();
    return res.status(200).json(updatedGoal);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Toggle milestone completion and recalculate progress percentage
 * @route  PATCH /api/goals/:id/milestones/:milestoneId
 * @access Private
 */
export const toggleMilestone = async (req, res, next) => {
  const { id, milestoneId } = req.params;

  try {
    const goal = await Goal.findOne({ _id: id, user: req.user._id, isActive: true });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found or unauthorized' });
    }

    // Find the specific subdocument using Mongoose DocumentArray.id() helper
    const milestone = goal.milestones.id(milestoneId);
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }

    // Toggle completion
    milestone.isComplete = !milestone.isComplete;
    milestone.completedAt = milestone.isComplete ? new Date() : null;

    // Recalculate overall progress
    const totalMilestones = goal.milestones.length;
    const completedMilestones = goal.milestones.filter((m) => m.isComplete).length;
    
    goal.progress = totalMilestones > 0 
      ? Math.round((completedMilestones / totalMilestones) * 100) 
      : 0;

    // Sync status based on updated progress
    if (goal.progress === 100) {
      goal.status = 'completed';
    } else if (goal.progress < 100 && goal.status === 'completed') {
      goal.status = 'active';
    }

    const updatedGoal = await goal.save();
    return res.status(200).json(updatedGoal);
  } catch (error) {
    next(error);
  }
};
