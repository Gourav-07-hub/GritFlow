import Achievement from '../models/Achievement.js';
import { checkAndAwardAchievements, ACHIEVEMENT_DEFINITIONS } from '../utils/achievementEngine.js';

/**
 * @desc    Get all achievements unlocked by logged in user
 * @route   GET /api/achievements
 * @access  `Private`
 */
export const getAchievements = async (req, res, next) => {
  try {
    const achievements = await Achievement.find({ user: req.user._id }).sort({
      unlockedAt: -1,
    });
    return res.status(200).json(achievements);
  } catch (error) {
    console.error('[getAchievements] Error:', error.message);
    return next(error);
  }
};

/**
 * @desc    Trigger achievement check and award eligible ones
 * @route   POST /api/achievements/check
 * @access  `Private`
 */
export const checkAchievements = async (req, res, next) => {
  try {
    const newlyUnlocked = await checkAndAwardAchievements(req.user._id);
    return res.status(200).json(newlyUnlocked);
  } catch (error) {
    console.error('[checkAchievements] Error:', error.message);
    return next(error);
  }
};

/**
 * @desc    Get achievements statistics and category breakdown
 * @route   GET /api/achievements/stats
 * @access  `Private`
 */
export const getAchievementStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Count unlocked achievements
    const unlockedAchievements = await Achievement.find({ user: userId });
    const totalUnlocked = unlockedAchievements.length;
    const totalPossible = ACHIEVEMENT_DEFINITIONS.length; // 26
    const percentage = totalPossible > 0 ? Math.round((totalUnlocked / totalPossible) * 100) : 0;

    // Initialize category counts
    const byCategory = {
      habits: 0,
      goals: 0,
      reflection: 0,
      focus: 0,
      gratitude: 0,
      general: 0,
    };

    unlockedAchievements.forEach((ach) => {
      if (byCategory[ach.category] !== undefined) {
        byCategory[ach.category]++;
      }
    });

    return res.status(200).json({
      total: totalUnlocked,
      possible: totalPossible,
      percentage,
      byCategory,
    });
  } catch (error) {
    console.error('[getAchievementStats] Error:', error.message);
    return next(error);
  }
};
