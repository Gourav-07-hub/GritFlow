/**
 * controllers/settingsController.js — User Settings and Profile/Account management logic
 */

import User from '../models/User.js';
import UserPreferences from '../models/UserPreferences.js';
import Habit from '../models/Habit.js';
import Goal from '../models/Goal.js';
import Reflection from '../models/Reflection.js';
import FocusSession from '../models/FocusSession.js';
import FocusSettings from '../models/FocusSettings.js';
import Gratitude from '../models/Gratitude.js';
import cloudinary from '../utils/cloudinary.js';


// ─── Profile Management ───────────────────────────────────────────────────────

/**
 * @desc   Get logged-in user profile details (no password)
 * @route  GET /api/settings/profile
 * @access Private
 */
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Update user display name, email, and avatar
 * @route  PUT /api/settings/profile
 * @access Private
 */
export const updateProfile = async (req, res, next) => {
  const { name, email, avatar } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if new email is already in use by another user
    if (email && email.toLowerCase() !== user.email.toLowerCase()) {
      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      user.email = email;
    }

    if (name) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;

    const updatedUser = await user.save();

    return res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      createdAt: updatedUser.createdAt,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Change user account password
 * @route  PUT /api/settings/password
 * @access Private
 */
export const changePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  try {
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    // Explicitly include password to perform validation check
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password match
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Check minimum length for new password
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Assign new password (pre-save middleware hashes it)
    user.password = newPassword;
    await user.save();

    return res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

// ─── Preferences Management ──────────────────────────────────────────────────

/**
 * @desc   Get user preferences (creates defaults if not found)
 * @route  GET /api/settings/preferences
 * @access Private
 */
export const getPreferences = async (req, res, next) => {
  try {
    let preferences = await UserPreferences.findOne({ user: req.user._id });
    if (!preferences) {
      preferences = await UserPreferences.create({ user: req.user._id });
    }

    return res.status(200).json(preferences);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Update/upsert user preferences config
 * @route  PUT /api/settings/preferences
 * @access Private
 */
export const updatePreferences = async (req, res, next) => {
  try {
    const updateData = {};

    // Standard properties
    for (const key of ['theme', 'language', 'timezone']) {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    }

    // Nested properties (to prevent completely overwriting nested objects)
    for (const group of ['notifications', 'dashboard', 'privacy']) {
      if (req.body[group] !== undefined && typeof req.body[group] === 'object') {
        for (const subKey of Object.keys(req.body[group])) {
          updateData[`${group}.${subKey}`] = req.body[group][subKey];
        }
      }
    }

    // Update or create (upsert)
    const preferences = await UserPreferences.findOneAndUpdate(
      { user: req.user._id },
      { $set: { ...updateData, updatedAt: Date.now() } },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json(preferences);
  } catch (error) {
    next(error);
  }
};

// ─── Account Deletion & Summary Stats ────────────────────────────────────────

/**
 * @desc   Permanently delete all user records from all collections
 * @route  DELETE /api/settings/account
 * @access Private
 */
export const deleteAccount = async (req, res, next) => {
  const { password } = req.body;

  try {
    if (!password) {
      return res.status(400).json({ message: 'Password confirmation is required' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify confirmation password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    const userId = req.user._id;

    // Hard-delete all data across all collections
    await Promise.all([
      User.deleteOne({ _id: userId }),
      UserPreferences.deleteOne({ user: userId }),
      Habit.deleteMany({ user: userId }),
      Goal.deleteMany({ user: userId }),
      Reflection.deleteMany({ user: userId }),
      FocusSession.deleteMany({ user: userId }),
      FocusSettings.deleteMany({ user: userId }),
      Gratitude.deleteMany({ user: userId }),
    ]);

    return res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get total summary stats for account details
 * @route  GET /api/settings/account-stats
 * @access Private
 */
export const getAccountStats = async (req, res, next) => {
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const [
      totalHabits,
      totalGoals,
      totalReflections,
      totalFocusSessions,
      totalGratitude,
      focusSessionsList,
    ] = await Promise.all([
      Habit.countDocuments({ user: userId, isActive: true }),
      Goal.countDocuments({ user: userId, isActive: true }),
      Reflection.countDocuments({ user: userId, isActive: true }),
      FocusSession.countDocuments({ user: userId }),
      Gratitude.countDocuments({ user: userId, isActive: true }),
      FocusSession.find({ user: userId }),
    ]);

    const totalFocusMinutes = focusSessionsList.reduce((sum, s) => sum + (s.duration || 0), 0);

    return res.status(200).json({
      memberSince: user.createdAt,
      totalHabits,
      totalGoals,
      totalReflections,
      totalFocusSessions,
      totalGratitude,
      totalFocusMinutes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Upload a new avatar to Cloudinary and update user profile picture
 * @route  POST /api/settings/avatar
 * @access Private
 */
export const uploadProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image file' });
    }

    const cloudinaryUrl = req.cloudinaryResult?.secure_url || req.file?.path;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If user has existing avatar that is a Cloudinary URL, delete it from Cloudinary
    if (user.avatar && user.avatar.includes('cloudinary.com')) {
      const extractPublicIdFromUrl = (url) => {
        try {
          const parts = url.split('/image/upload/');
          if (parts.length < 2) return null;
          
          let publicIdWithExtension = parts[1];
          if (publicIdWithExtension.startsWith('v')) {
            const slashIndex = publicIdWithExtension.indexOf('/');
            if (slashIndex !== -1) {
              publicIdWithExtension = publicIdWithExtension.substring(slashIndex + 1);
            }
          }
          
          const dotIndex = publicIdWithExtension.lastIndexOf('.');
          if (dotIndex !== -1) {
            return publicIdWithExtension.substring(0, dotIndex);
          }
          return publicIdWithExtension;
        } catch (err) {
          console.error('Failed to extract Cloudinary public_id:', err);
          return null;
        }
      };

      const publicId = extractPublicIdFromUrl(user.avatar);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }

    user.avatar = cloudinaryUrl;
    await user.save();

    return res.status(200).json({
      message: 'Profile picture updated successfully',
      avatar: cloudinaryUrl,
    });
  } catch (error) {
    next(error);
  }
};
